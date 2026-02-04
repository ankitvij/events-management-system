<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function index(Request $request)
    {
        // Ensure a cart exists for the session (create for guests) so views can safely load relations
        $cart = $this->getCart($request, true);
        $cart->load('items.ticket', 'items.event');
        $count = $cart->items->sum('quantity');
        $total = $cart->items->sum(function ($i) { return $i->quantity * $i->price; });
        return inertia('Cart/Index', ['cart' => $cart, 'cart_count' => $count, 'cart_total' => $total]);
    }

    public function storeItem(Request $request)
    {
        $data = $request->validate([
            'ticket_id' => 'nullable|integer',
            'event_id' => 'nullable|integer',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
        ]);

        $cart = $this->getCart($request, true);

        // If an identical item (same ticket & event) exists, increment its quantity instead of creating a new row.
        $existing = null;
        if (! empty($data['ticket_id']) || ! empty($data['event_id'])) {
            $query = CartItem::where('cart_id', $cart->id)->where('ticket_id', $data['ticket_id'] ?? null)->where('event_id', $data['event_id'] ?? null);
            $existing = $query->first();
        }

        if ($existing) {
            $existing->quantity = $existing->quantity + $data['quantity'];
            // Update price in case price changed (keep latest)
            $existing->price = $data['price'];
            $existing->save();
            $item = $existing;
        } else {
            $item = CartItem::create(array_merge($data, ['cart_id' => $cart->id]));
        }

        if ($request->wantsJson() || $request->ajax()) {
            // return updated cart summary as well to help the frontend update UI
            $cart->load('items.ticket', 'items.event');
            $count = $cart->items->sum('quantity');
            $total = $cart->items->sum(function ($i) { return $i->quantity * $i->price; });
            return response()->json(['success' => true, 'item' => $item, 'cart_id' => $cart->id, 'count' => $count, 'total' => $total]);
        }

        return redirect()->back();
    }

    public function summary(Request $request)
    {
        $cart = $this->getCart($request);
        if (! $cart) {
            return response()->json(['items' => [], 'count' => 0, 'total' => 0]);
        }
        $cart->load('items.ticket', 'items.event');
        $count = $cart->items->sum('quantity');
        $total = $cart->items->sum(function ($i) {
            return $i->quantity * $i->price;
        });
        return response()->json(['items' => $cart->items, 'count' => $count, 'total' => $total]);
    }

    public function checkout(Request $request)
    {
        $cart = $this->getCart($request);
        if (! $cart || $cart->items()->count() === 0) {
            return redirect()->back()->with('error', 'Cart is empty');
        }

        try {
            DB::transaction(function () use ($cart) {
                $cart->load('items');
                foreach ($cart->items as $item) {
                    if ($item->ticket_id) {
                        $ticket = Ticket::lockForUpdate()->find($item->ticket_id);
                        if (! $ticket || $ticket->quantity_available < $item->quantity) {
                            throw new \Exception('Insufficient availability for ticket id: ' . $item->ticket_id);
                        }
                        $ticket->quantity_available = max(0, $ticket->quantity_available - $item->quantity);
                        $ticket->save();
                    }
                }

                // clear cart items after successful reservation
                $cart->items()->delete();
            });
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->route('cart.index')->with('success', 'Checkout complete');
    }

    public function updateItem(Request $request, CartItem $item)
    {
        $data = $request->validate(['quantity' => 'required|integer|min:1']);
        $item->update($data);
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['success' => true, 'item' => $item]);
        }

        return redirect()->back();
    }

    public function destroyItem(CartItem $item)
    {
        $item->delete();
        if (request()->wantsJson() || request()->ajax()) {
            return response()->json(['success' => true]);
        }

        return redirect()->back();
    }

    protected function getCart(Request $request, $create = false)
    {
        if ($request->user()) {
            $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
            return $cart;
        }

        $sid = $request->session()->getId();
        $cart = Cart::where('session_id', $sid)->first();
        if (! $cart && $create) {
            $cart = Cart::create(['session_id' => $sid]);
        }
        return $cart;
    }
}
