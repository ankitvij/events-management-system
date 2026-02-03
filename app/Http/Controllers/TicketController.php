<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function store(Request $request, Event $event)
    {
        $current = $request->user();
        if (! $current || (! $current->is_super_admin && $event->user_id !== $current->id)) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'quantity_total' => 'nullable|integer|min:0',
            'quantity_available' => 'nullable|integer|min:0',
            'active' => 'boolean',
        ]);

        DB::transaction(function () use ($event, $data) {
            $ticket = $event->tickets()->create(array_merge($data, [
                'quantity_available' => $data['quantity_available'] ?? ($data['quantity_total'] ?? 0),
            ]));
        });

        return redirect()->back()->with('success', 'Ticket created.');
    }

    public function update(Request $request, Event $event, Ticket $ticket)
    {
        $current = $request->user();
        if (! $current || (! $current->is_super_admin && $event->user_id !== $current->id)) {
            abort(403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'quantity_total' => 'nullable|integer|min:0',
            'quantity_available' => 'nullable|integer|min:0',
            'active' => 'boolean',
        ]);

        $ticket->update($data);

        return redirect()->back()->with('success', 'Ticket updated.');
    }

    public function destroy(Event $event, Ticket $ticket)
    {
        $current = request()->user();
        if (! $current || (! $current->is_super_admin && $event->user_id !== $current->id)) {
            abort(403);
        }

        $ticket->delete();

        return redirect()->back()->with('success', 'Ticket deleted.');
    }
}
