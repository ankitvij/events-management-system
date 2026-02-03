<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = $this->getCart($request);
        $cart->load('items');
        return inertia('Cart/Index', ['cart' => $cart]);
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

        $item = CartItem::create(array_merge($data, ['cart_id' => $cart->id]));

        return redirect()->back();
    }

    public function updateItem(Request $request, CartItem $item)
    {
        $data = $request->validate(['quantity' => 'required|integer|min:1']);
        $item->update($data);
        return redirect()->back();
    }

    public function destroyItem(CartItem $item)
    {
        $item->delete();
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
