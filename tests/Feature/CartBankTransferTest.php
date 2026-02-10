<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Event;
use App\Models\Organiser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Session;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CartBankTransferTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_uses_pivot_organiser_when_primary_null(): void
    {
        Session::start();

        $organiser = Organiser::create([
            'name' => 'Bank Org',
            'email' => 'bank@example.test',
            'active' => true,
            'bank_account_name' => 'Bank Org Account',
            'bank_iban' => 'DE02120300000000202051',
            'bank_bic' => 'BYLADEM1001',
            'bank_reference_hint' => 'Use booking code',
            'bank_instructions' => 'Transfer within 3 days',
        ]);

        $event = Event::factory()->create([
            'organiser_id' => null,
        ]);
        $event->organisers()->sync([$organiser->id]);

        $cart = Cart::create(['session_id' => Session::getId()]);
        CartItem::create([
            'cart_id' => $cart->id,
            'event_id' => $event->id,
            'quantity' => 1,
            'price' => 25.00,
        ]);

        $this->get(route('cart.checkout.form', ['cart_id' => $cart->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Cart/Checkout')
                ->where('bank_transfer.account_name', 'Bank Org Account')
                ->where('bank_transfer.iban', 'DE02120300000000202051')
                ->where('bank_transfer.bic', 'BYLADEM1001')
                ->where('bank_transfer.reference_hint', 'Use booking code')
                ->where('bank_transfer.instructions', 'Transfer within 3 days')
            );
    }
}
