<?php

namespace App\Http\Controllers;

use App\Mail\OrderConfirmed;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class CartController extends Controller
{
    public function index(Request $request)
    {
        // Ensure a cart exists for the session (create for guests) so views can safely load relations
        $cart = $this->getCart($request, true);
        if (! $cart) {
            $cart = Cart::create(['session_id' => $request->session()->getId() ?? null]);
        }
        if ($cart) {
            $cart->load('items.ticket', 'items.event');
            $count = $cart->items->sum('quantity');
            $total = $cart->items->sum(function ($i) {
                return $i->quantity * $i->price;
            });
        } else {
            // Fallback: present an empty cart object for views to render safely
            $cart = new Cart;
            $cart->setRelation('items', collect());
            $count = 0;
            $total = 0;
        }

        return inertia('Cart/Index', ['cart' => $cart, 'cart_count' => $count, 'cart_total' => $total]);
    }

    public function checkoutForm(Request $request)
    {
        $cart = $this->getCart($request, true);
        if (! $cart) {
            $cart = Cart::create(['session_id' => $request->session()->getId() ?? null]);
        }
        if ($cart) {
            $cart->load('items.ticket', 'items.event');
            $count = $cart->items->sum('quantity');
            $total = $cart->items->sum(function ($i) {
                return $i->quantity * $i->price;
            });
        } else {
            $cart = new Cart;
            $cart->setRelation('items', collect());
            $count = 0;
            $total = 0;
        }

        return inertia('Cart/Checkout', ['cart' => $cart, 'cart_count' => $count, 'cart_total' => $total]);
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
            $total = $cart->items->sum(function ($i) {
                return $i->quantity * $i->price;
            });

            return response()->json(['success' => true, 'item' => $item, 'cart_id' => $cart->id, 'count' => $count, 'total' => $total]);
        }

        return redirect()->back();
    }

    public function summary(Request $request)
    {
        $cart = $this->getCart($request);
        if (! $cart) {
            return response()->json([
                'count' => 0,
                'total' => 0,
                'items' => [],
            ]);
        }

        $cart->load('items.ticket', 'items.event');
        $count = $cart->items->sum('quantity');
        $total = $cart->items->sum(function ($item) {
            return $item->quantity * $item->price;
        });

        return response()->json([
            'count' => $count,
            'total' => $total,
            'items' => $cart->items,
        ]);
    }

    public function checkout(Request $request)
    {
        $cart = $this->getCart($request);
        if (! $cart || $cart->items()->count() === 0) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['success' => false, 'message' => 'Cart is empty'], 400);
            }

            return redirect()->back()->with('error', 'Cart is empty');
        }

        $incomingEmail = $request->input('email');
        $incomingName = $request->input('name');
        $incomingPassword = $request->input('password');
        $ticketGuests = $request->input('ticket_guests', []);
        if (! is_array($ticketGuests)) {
            $ticketGuests = [];
        }
        $ticketGuestsByItem = collect($ticketGuests)->filter(function ($entry) {
            return is_array($entry) && isset($entry['cart_item_id']);
        })->keyBy('cart_item_id');

        try {
            $result = DB::transaction(function () use ($cart, $incomingEmail, $incomingName, $incomingPassword, $ticketGuestsByItem) {
                $cart->load('items');
                foreach ($cart->items as $item) {
                    if ($item->ticket_id) {
                        $ticket = Ticket::lockForUpdate()->find($item->ticket_id);
                        if (! $ticket || $ticket->quantity_available < $item->quantity) {
                            throw new \Exception('Insufficient availability for ticket id: '.$item->ticket_id);
                        }
                        $ticket->quantity_available = max(0, $ticket->quantity_available - $item->quantity);
                        $ticket->save();
                    }
                }

                // create an order and order items to represent this reservation
                // generate a unique 10-digit booking code for this order
                do {
                    try {
                        $code = (string) random_int(1000000000, 9999999999);
                    } catch (\Throwable $e) {
                        // fallback if random_int is not available
                        $code = substr((string) time().(string) rand(1000, 9999), 0, 10);
                    }
                } while (\App\Models\Order::where('booking_code', $code)->exists());
                $total = $cart->items->sum(function ($i) {
                    return $i->quantity * $i->price;
                });
                $order = Order::create([
                    'booking_code' => $code,
                    'user_id' => $cart->user_id ?? null,
                    'session_id' => $cart->session_id ?? null,
                    'status' => 'confirmed',
                    'total' => $total,
                    'contact_name' => null,
                    'contact_email' => null,
                ]);

                foreach ($cart->items as $item) {
                    $guestDetails = null;
                    $entry = $ticketGuestsByItem->get($item->id);
                    if (is_array($entry) && isset($entry['guests']) && is_array($entry['guests'])) {
                        $guestDetails = collect($entry['guests'])->map(function ($guest) {
                            if (! is_array($guest)) {
                                return null;
                            }

                            $name = trim((string) ($guest['name'] ?? ''));
                            $email = trim((string) ($guest['email'] ?? ''));

                            if ($name === '' && $email === '') {
                                return null;
                            }

                            return [
                                'name' => $name ?: null,
                                'email' => $email ?: null,
                            ];
                        })->filter()->values()->all();

                        if (is_array($guestDetails)) {
                            $guestDetails = array_slice($guestDetails, 0, $item->quantity);
                        }
                    }

                    OrderItem::create([
                        'order_id' => $order->id,
                        'ticket_id' => $item->ticket_id,
                        'event_id' => $item->event_id,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'guest_details' => $guestDetails,
                    ]);
                }

                // clear cart items after successful reservation
                $cart->items()->delete();

                // associate a customer when an email was provided
                $customerId = null;
                if ($incomingEmail) {
                    $customer = Customer::where('email', $incomingEmail)->first();
                    if (! $customer) {
                        $attrs = [
                            'name' => $incomingName ?: 'Guest',
                            'email' => $incomingEmail,
                            'phone' => null,
                            'active' => true,
                        ];
                        if (Schema::hasColumn('customers', 'password') && $incomingPassword) {
                            $attrs['password'] = Hash::make($incomingPassword);
                        }
                        $customer = Customer::create($attrs);
                    } else {
                        // if password provided and customer has no password, set it (only when column exists)
                        if ($incomingPassword && Schema::hasColumn('customers', 'password')) {
                            if (! $customer->password) {
                                $customer->password = Hash::make($incomingPassword);
                                $customer->save();
                            }
                        }
                    }
                    $customerId = $customer->id;
                    $order->customer_id = $customerId;
                    $order->save();
                }

                return ['order' => $order, 'customer_id' => $customerId];
            });

            // attempt to send confirmation email outside transaction
            $recipient = null;
            if ($cart->user) {
                $recipient = $cart->user->email;
            }
            // prefer contact email passed during guest checkout
            if (! $recipient && $incomingEmail) {
                $recipient = $incomingEmail;
            }
            if (isset($result['order'])) {
                $order = $result['order'];
                // persist contact details on order if provided
                $order->contact_name = $incomingName ?: $order->contact_name;
                $order->contact_email = $incomingEmail ?: $order->contact_email;
                $order->save();
            }

            // If customer created/identified and password was provided, log them into customer session
            if (! empty($result['customer_id']) && $incomingPassword) {
                session()->put('customer_id', $result['customer_id']);
            }
            if (isset($order) && $recipient) {
                $order->loadMissing('items.ticket.event', 'user');
                try {
                    foreach ($order->items as $item) {
                        $names = collect(is_array($item->guest_details) ? $item->guest_details : [])
                            ->pluck('name')
                            ->filter()
                            ->values();
                        $total = max(1, (int) $item->quantity);
                        for ($i = 0; $i < $total; $i++) {
                            $name = $names->get($i);
                            Mail::to($recipient)->send(new OrderConfirmed($order, $item, $name));
                        }
                    }
                } catch (\Throwable $e) {
                    logger()->error('Order confirmation mail failed: '.$e->getMessage());
                }
            }
        } catch (\Throwable $e) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
            }

            return redirect()->back()->with('error', $e->getMessage());
        }

        // prefer display the order confirmation page with details
        $recipientEmail = $order->contact_email ?: ($order->user->email ?? $incomingEmail ?? null);

        if ($request->wantsJson() || $request->ajax()) {
            $customerCreated = false;
            if (isset($result) && is_array($result) && ! empty($result['customer_id'])) {
                $customerCreated = true;
            }

            return response()->json([
                'success' => true,
                'order_id' => $order->id,
                'email' => $recipientEmail,
                'booking_code' => $order->booking_code,
                'customer_created' => $customerCreated,
            ]);
        }

        $message = 'Order placed successfully.';
        if ($recipientEmail) {
            $message .= " A confirmation has been sent to {$recipientEmail}.";
        }
        $message .= " For any questions reply to that email or mention order number #{$order->id}.";

        // Include booking_code as query param so guests can view their order confirmation
        return redirect()->route('orders.show', ['order' => $order->id, 'booking_code' => $order->booking_code])->with('success', $message);
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

        // Allow lookup by explicit cart_id cookie or request parameter (useful for tests and some clients)
        $cookieCartId = $request->cookie('cart_id');
        $paramCartId = $request->input('cart_id');
        $cartIdToFind = $cookieCartId ?: $paramCartId;
        if ($cartIdToFind) {
            $cart = Cart::find($cartIdToFind);
            if ($cart) {
                return $cart;
            }
        }

        $sid = $request->session()->getId();
        $cart = Cart::where('session_id', $sid)->first();
        if (! $cart && $create) {
            $cart = Cart::create(['session_id' => $sid]);
        }

        return $cart;
    }
}
