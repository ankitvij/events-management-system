<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Event;
use App\Models\PaymentSetting;
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

        $bank = config('payments.bank_transfer');
        $event = Event::factory()->create();

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
                ->where('payment_methods.bank_transfer.account_name', $bank['account_name'])
                ->where('payment_methods.bank_transfer.iban', $bank['iban'])
                ->where('payment_methods.bank_transfer.bic', $bank['bic'])
                ->where('payment_methods.bank_transfer.reference_hint', $bank['reference_hint'])
                ->where('payment_methods.bank_transfer.instructions', $bank['instructions'])
            );
    }

    public function test_checkout_uses_paypal_fields_for_paypal_transfer(): void
    {
        Session::start();

        $paypal = config('payments.paypal_transfer');
        $event = Event::factory()->create();

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
                ->where('payment_methods.paypal_transfer.account_id', $paypal['account_id'])
                ->where('payment_methods.paypal_transfer.instructions', $paypal['instructions'])
            );
    }

    public function test_checkout_uses_payment_settings_overrides(): void
    {
        Session::start();

        PaymentSetting::create([
            'bank_account_name' => 'Override Bank',
            'bank_iban' => 'GB55BANK00000000012345',
            'bank_bic' => 'BANKGB2L',
            'bank_reference_hint' => 'Use override reference',
            'bank_instructions' => 'Pay within 5 days',
            'paypal_id' => 'override-paypal',
            'paypal_instructions' => 'PayPal override instructions',
        ]);

        $event = Event::factory()->create();
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
                ->where('payment_methods.bank_transfer.account_name', 'Override Bank')
                ->where('payment_methods.bank_transfer.iban', 'GB55BANK00000000012345')
                ->where('payment_methods.bank_transfer.bic', 'BANKGB2L')
                ->where('payment_methods.bank_transfer.reference_hint', 'Use override reference')
                ->where('payment_methods.bank_transfer.instructions', 'Pay within 5 days')
                ->where('payment_methods.paypal_transfer.account_id', 'override-paypal')
                ->where('payment_methods.paypal_transfer.instructions', 'PayPal override instructions')
            );
    }
}
