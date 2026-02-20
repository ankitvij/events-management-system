<?php

namespace App\Http\Controllers;

use App\Mail\LoginTokenMail;
use App\Models\Event;
use App\Models\EventTicketController;
use App\Models\LoginToken;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class EventTicketControllerController extends Controller
{
    public function store(Request $request, Event $event): RedirectResponse
    {
        $this->authorizeEventManager($request, $event);

        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = strtolower(trim($data['email']));

        if ($event->ticketControllers()->where('email', $email)->exists()) {
            return back()->withErrors(['ticket_controller_email' => 'This email is already a ticket controller for the event.']);
        }

        $count = $event->ticketControllers()->count();
        if ($count >= 10) {
            return back()->withErrors(['ticket_controller_email' => 'You can add up to 10 ticket controller emails per event.']);
        }

        $event->ticketControllers()->create([
            'email' => $email,
        ]);

        $plain = Str::random(64);
        $hash = hash('sha256', $plain);

        LoginToken::query()
            ->where('type', 'ticket_controller')
            ->where('email', $email)
            ->whereNull('used_at')
            ->delete();

        LoginToken::query()->create([
            'email' => $email,
            'token_hash' => $hash,
            'type' => 'ticket_controller',
            'expires_at' => now()->addYears(100),
        ]);

        $url = route('ticket-controllers.login.consume', ['token' => $plain]);
        Mail::to($email)->send(new LoginTokenMail(
            $url,
            'Your ticket controller login link',
            'Use the button below to sign in and check in tickets for your assigned events.',
            'Ticket controller login'
        ));

        return back()->with('success', 'Ticket controller added and login link emailed.');
    }

    public function destroy(Request $request, Event $event, EventTicketController $ticketController): RedirectResponse
    {
        $this->authorizeEventManager($request, $event);

        if ($ticketController->event_id !== $event->id) {
            abort(404);
        }

        $ticketController->delete();

        return back()->with('success', 'Ticket controller removed.');
    }

    protected function authorizeEventManager(Request $request, Event $event): void
    {
        $current = $request->user();
        if (! $current) {
            abort(403);
        }

        if (! ($current->is_super_admin || (int) $event->user_id === (int) $current->id)) {
            abort(403);
        }
    }
}
