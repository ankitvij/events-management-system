<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Http\Requests\StoreDiscountCodeRequest;
use App\Http\Requests\UpdateDiscountCodeRequest;
use App\Models\DiscountCode;
use App\Models\Event;
use App\Models\Organiser;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DiscountCodeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Request $request): Response
    {
        $current = $request->user();
        if (! $current) {
            abort(403);
        }

        $codes = DiscountCode::query()
            ->with(['promoter:id,name,email', 'creator:id,name,email', 'organiser:id,name,email', 'discounts.ticket:id,name,price'])
            ->orderByDesc('id')
            ->get()
            ->filter(fn (DiscountCode $discountCode) => $this->canManageDiscountCode($current, $discountCode))
            ->values();

        return Inertia::render('DiscountCodes/Index', [
            'discountCodes' => $codes,
        ]);
    }

    public function create(Request $request): Response
    {
        $current = $request->user();
        if (! $current) {
            abort(403);
        }

        return Inertia::render('DiscountCodes/Create', [
            'events' => $this->availableEventsForCurrent($current),
            'promoters' => $this->availablePromotersForCurrent($current),
        ]);
    }

    public function store(StoreDiscountCodeRequest $request): RedirectResponse
    {
        $current = $request->user();
        if (! $current) {
            abort(403);
        }

        $data = $request->validated();
        $normalisedCode = strtoupper(trim((string) $data['code']));
        $promoterUserId = isset($data['promoter_user_id']) ? (int) $data['promoter_user_id'] : null;
        $discounts = collect($data['discounts'])->map(fn (array $row) => [
            'event_id' => (int) $row['event_id'],
            'ticket_id' => (int) $row['ticket_id'],
            'discount_type' => (string) $row['discount_type'],
            'discount_value' => (float) $row['discount_value'],
        ])->values();

        $organiserIds = $this->organiserIdsForUser($current);
        $isOrganiserUser = $organiserIds->isNotEmpty();

        $this->assertDiscountRowsAreValid($discounts);
        $this->assertCanUseEvents($current, $discounts->pluck('event_id')->unique()->values(), $isOrganiserUser, $organiserIds);

        if ($isOrganiserUser) {
            if ($promoterUserId) {
                $this->assertPromoterLinkedToAllDiscountEvents($promoterUserId, $discounts);
            }
        } else {
            if ($promoterUserId && $promoterUserId !== (int) $current->id) {
                abort(403);
            }
            $promoterUserId = (int) $current->id;
        }

        DB::transaction(function () use ($current, $normalisedCode, $promoterUserId, $discounts, $isOrganiserUser, $organiserIds, $data): void {
            $discountCode = DiscountCode::query()->create([
                'code' => $normalisedCode,
                'created_by_user_id' => $current->id,
                'promoter_user_id' => $promoterUserId,
                'organiser_id' => $isOrganiserUser ? (int) $organiserIds->first() : null,
                'active' => (bool) ($data['active'] ?? true),
            ]);

            foreach ($discounts as $row) {
                $discountCode->discounts()->create($row);
            }
        });

        return redirect()->route('discount-codes.index')->with('success', 'Discount code created.');
    }

    public function show(DiscountCode $discountCode): RedirectResponse
    {
        return redirect()->route('discount-codes.edit', $discountCode);
    }

    public function edit(Request $request, DiscountCode $discountCode): Response
    {
        $current = $request->user();
        if (! $current || ! $this->canManageDiscountCode($current, $discountCode)) {
            abort(403);
        }

        $discountCode->load(['discounts']);

        return Inertia::render('DiscountCodes/Edit', [
            'discountCode' => $discountCode,
            'events' => $this->availableEventsForCurrent($current),
            'promoters' => $this->availablePromotersForCurrent($current),
        ]);
    }

    public function update(UpdateDiscountCodeRequest $request, DiscountCode $discountCode): RedirectResponse
    {
        $current = $request->user();
        if (! $current || ! $this->canManageDiscountCode($current, $discountCode)) {
            abort(403);
        }

        $data = $request->validated();
        $normalisedCode = strtoupper(trim((string) $data['code']));
        $promoterUserId = isset($data['promoter_user_id']) ? (int) $data['promoter_user_id'] : null;
        $discounts = collect($data['discounts'])->map(fn (array $row) => [
            'event_id' => (int) $row['event_id'],
            'ticket_id' => (int) $row['ticket_id'],
            'discount_type' => (string) $row['discount_type'],
            'discount_value' => (float) $row['discount_value'],
        ])->values();

        $organiserIds = $this->organiserIdsForUser($current);
        $isOrganiserUser = $organiserIds->isNotEmpty();

        $this->assertDiscountRowsAreValid($discounts);
        $this->assertCanUseEvents($current, $discounts->pluck('event_id')->unique()->values(), $isOrganiserUser, $organiserIds);

        if ($isOrganiserUser) {
            if ($promoterUserId) {
                $this->assertPromoterLinkedToAllDiscountEvents($promoterUserId, $discounts);
            }
        } else {
            $promoterUserId = (int) $current->id;
        }

        DB::transaction(function () use ($discountCode, $normalisedCode, $promoterUserId, $discounts, $data): void {
            $discountCode->update([
                'code' => $normalisedCode,
                'promoter_user_id' => $promoterUserId,
                'active' => (bool) ($data['active'] ?? true),
            ]);

            $discountCode->discounts()->delete();
            foreach ($discounts as $row) {
                $discountCode->discounts()->create($row);
            }
        });

        return redirect()->route('discount-codes.index')->with('success', 'Discount code updated.');
    }

    public function destroy(Request $request, DiscountCode $discountCode): RedirectResponse
    {
        $current = $request->user();
        if (! $current || ! $this->canManageDiscountCode($current, $discountCode)) {
            abort(403);
        }

        $discountCode->delete();

        return redirect()->route('discount-codes.index')->with('success', 'Discount code deleted.');
    }

    protected function availableEventsForCurrent(User $current): Collection
    {
        $query = Event::query()->with(['tickets:id,event_id,name,price', 'promoters:id,name,email'])->orderBy('title');

        if ($current->is_super_admin || $current->role === Role::ADMIN) {
            return $query->get(['id', 'title', 'organiser_id', 'agency_id']);
        }

        if ($current->hasRole(Role::AGENCY->value) && ! $current->hasRole([Role::ADMIN->value, Role::SUPER_ADMIN->value])) {
            return $query->where('agency_id', $current->agency_id)->get(['id', 'title', 'organiser_id', 'agency_id']);
        }

        $organiserIds = $this->organiserIdsForUser($current);
        if ($organiserIds->isNotEmpty()) {
            return $query->where(function ($builder) use ($organiserIds): void {
                $builder->whereIn('organiser_id', $organiserIds->all())
                    ->orWhereHas('organisers', function ($subQuery) use ($organiserIds): void {
                        $subQuery->whereIn('organisers.id', $organiserIds->all());
                    });
            })->get(['id', 'title', 'organiser_id', 'agency_id']);
        }

        return $query->whereHas('promoters', function ($subQuery) use ($current): void {
            $subQuery->where('users.id', $current->id);
        })->get(['id', 'title', 'organiser_id', 'agency_id']);
    }

    protected function availablePromotersForCurrent(User $current): Collection
    {
        $query = User::query()
            ->where('is_super_admin', false)
            ->where('active', true)
            ->where('role', Role::USER->value)
            ->orderBy('name');

        if ($current->is_super_admin || $current->role === Role::ADMIN) {
            return $query->get(['id', 'name', 'email']);
        }

        if ($current->hasRole(Role::AGENCY->value) && ! $current->hasRole([Role::ADMIN->value, Role::SUPER_ADMIN->value])) {
            return $query->where('agency_id', $current->agency_id)->get(['id', 'name', 'email']);
        }

        return $query->whereKey($current->id)->get(['id', 'name', 'email']);
    }

    protected function organiserIdsForUser(User $current): Collection
    {
        if (! $current->email) {
            return collect();
        }

        return Organiser::query()->where('email', $current->email)->pluck('id');
    }

    protected function canManageDiscountCode(User $current, DiscountCode $discountCode): bool
    {
        if ($current->is_super_admin || $current->role === Role::ADMIN) {
            return true;
        }

        if ($current->hasRole(Role::AGENCY->value) && ! $current->hasRole([Role::ADMIN->value, Role::SUPER_ADMIN->value])) {
            return $discountCode->discounts()
                ->whereHas('event', fn ($query) => $query->where('agency_id', $current->agency_id))
                ->exists();
        }

        $organiserIds = $this->organiserIdsForUser($current);
        if ($organiserIds->isNotEmpty()) {
            if ($discountCode->organiser_id && $organiserIds->contains((int) $discountCode->organiser_id)) {
                return true;
            }

            return $discountCode->discounts()->whereHas('event', function ($query) use ($organiserIds): void {
                $query->whereIn('organiser_id', $organiserIds->all())
                    ->orWhereHas('organisers', function ($subQuery) use ($organiserIds): void {
                        $subQuery->whereIn('organisers.id', $organiserIds->all());
                    });
            })->exists();
        }

        return (int) ($discountCode->promoter_user_id ?? 0) === (int) $current->id;
    }

    protected function assertCanUseEvents(User $current, Collection $eventIds, bool $isOrganiserUser, Collection $organiserIds): void
    {
        $events = Event::query()->whereIn('id', $eventIds->all())->with('organisers:id')->get(['id', 'organiser_id', 'agency_id']);

        if ($events->count() !== $eventIds->count()) {
            abort(422, 'Invalid event in discounts list.');
        }

        foreach ($events as $event) {
            if ($current->is_super_admin || $current->role === Role::ADMIN) {
                continue;
            }

            if ($current->hasRole(Role::AGENCY->value) && ! $current->hasRole([Role::ADMIN->value, Role::SUPER_ADMIN->value])) {
                if ((int) ($event->agency_id ?? 0) !== (int) ($current->agency_id ?? 0)) {
                    abort(403);
                }

                continue;
            }

            if ($isOrganiserUser) {
                $matchesPrimary = $organiserIds->contains((int) ($event->organiser_id ?? 0));
                $matchesLinked = $event->organisers->pluck('id')->intersect($organiserIds)->isNotEmpty();
                if (! $matchesPrimary && ! $matchesLinked) {
                    abort(403);
                }

                continue;
            }

            $isPromoterOnEvent = $event->promoters()->where('users.id', $current->id)->exists();
            if (! $isPromoterOnEvent) {
                abort(403);
            }
        }
    }

    protected function assertPromoterLinkedToAllDiscountEvents(int $promoterUserId, Collection $discounts): void
    {
        $eventIds = $discounts->pluck('event_id')->unique()->values();
        foreach ($eventIds as $eventId) {
            $isLinked = Event::query()->whereKey($eventId)->whereHas('promoters', function ($query) use ($promoterUserId): void {
                $query->where('users.id', $promoterUserId);
            })->exists();

            if (! $isLinked) {
                abort(422, 'Assigned promoter must be linked to each selected event.');
            }
        }
    }

    protected function assertDiscountRowsAreValid(Collection $discounts): void
    {
        $ticketIds = $discounts->pluck('ticket_id')->unique()->values();
        $tickets = Ticket::query()->whereIn('id', $ticketIds->all())->get(['id', 'event_id', 'price']);

        if ($tickets->count() !== $ticketIds->count()) {
            abort(422, 'Invalid ticket in discounts list.');
        }

        $ticketById = $tickets->keyBy('id');
        foreach ($discounts as $row) {
            $ticket = $ticketById->get((int) $row['ticket_id']);
            if (! $ticket || (int) $ticket->event_id !== (int) $row['event_id']) {
                abort(422, 'Ticket does not belong to selected event.');
            }

            if ($row['discount_type'] === 'percentage' && (float) $row['discount_value'] > 100) {
                abort(422, 'Percentage discount must be at most 100.');
            }

            if ($row['discount_type'] === 'euro' && (float) $row['discount_value'] > (float) $ticket->price) {
                abort(422, 'Euro discount cannot exceed ticket price.');
            }
        }
    }
}
