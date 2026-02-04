<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::with('items.ticket', 'user')->latest()->paginate(20);
        return inertia('Orders/Index', ['orders' => $orders]);
    }

    public function show(Order $order)
    {
        $order->load('items.ticket', 'user');
        return inertia('Orders/Show', ['order' => $order]);
    }
}
