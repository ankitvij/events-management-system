<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\DiscountCode;
use App\Models\Event;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class DiscountCodeRedemptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_percentage_discount_is_applied_to_checkout_and_order(): void
    {
        Mail::fake();
        [$cart, $ticket, $discountCode] = $this->cartWithDiscount('SAVE10', 'percentage', 10, 50);

        $response = $this->postJson('/cart/checkout', $this->checkoutPayload($cart, $ticket, $discountCode));

        $response->assertOk()->assertJson(['success' => true]);
        $this->assertDatabaseHas('orders', [
            'discount_code_id' => $discountCode->id,
            'discount_amount' => 5,
            'total' => 45,
        ]);
        $this->assertDatabaseHas('order_items', ['ticket_id' => $ticket->id, 'price' => 45]);
    }

    public function test_fixed_discount_is_applied_to_each_matching_ticket(): void
    {
        Mail::fake();
        [$cart, $ticket, $discountCode] = $this->cartWithDiscount('MINUS5', 'euro', 5, 40, 2);

        $response = $this->postJson('/cart/checkout', $this->checkoutPayload($cart, $ticket, $discountCode, 2));

        $response->assertOk()->assertJson(['success' => true]);
        $this->assertDatabaseHas('orders', [
            'discount_code_id' => $discountCode->id,
            'discount_amount' => 10,
            'total' => 70,
        ]);
        $this->assertDatabaseHas('order_items', ['ticket_id' => $ticket->id, 'price' => 35]);
    }

    public function test_invalid_or_inapplicable_discount_code_is_rejected(): void
    {
        Mail::fake();
        [$cart, $ticket] = $this->cartWithDiscount('VALID01', 'percentage', 10, 20);

        $invalid = $this->postJson('/cart/checkout', $this->checkoutPayload($cart, $ticket, 'MISSING'));
        $invalid->assertStatus(422)->assertJsonValidationErrors('discount_code');

        $otherTicket = Ticket::query()->create([
            'event_id' => $ticket->event_id,
            'name' => 'Other ticket',
            'price' => 20,
            'quantity_total' => 10,
            'quantity_available' => 10,
            'active' => true,
        ]);
        $inapplicableCode = DiscountCode::query()->create(['code' => 'OTHER01', 'active' => true]);
        $inapplicableCode->discounts()->create([
            'event_id' => $ticket->event_id,
            'ticket_id' => $otherTicket->id,
            'discount_type' => 'percentage',
            'discount_value' => 10,
        ]);

        $inapplicable = $this->postJson('/cart/checkout', $this->checkoutPayload($cart, $ticket, $inapplicableCode));
        $inapplicable->assertStatus(422)->assertJsonValidationErrors('discount_code');
    }

    public function test_discount_code_can_be_applied_before_checkout(): void
    {
        [$cart, $ticket, $discountCode] = $this->cartWithDiscount('APPLY10', 'percentage', 10, 30);

        $response = $this->postJson('/cart/discount', [
            'discount_code' => 'apply10',
            'cart_id' => $cart->id,
        ]);

        $response->assertOk()->assertJson([
            'code' => $discountCode->code,
            'subtotal' => 30,
            'discount_amount' => 3,
            'total' => 27,
        ]);
    }

    /**
     * @return array{0: Cart, 1: Ticket, 2: DiscountCode}
     */
    private function cartWithDiscount(string $code, string $type, float $value, float $price, int $quantity = 1): array
    {
        $event = Event::factory()->create();
        $ticket = Ticket::query()->create([
            'event_id' => $event->id,
            'name' => 'Discount ticket',
            'price' => $price,
            'quantity_total' => 20,
            'quantity_available' => 20,
            'active' => true,
        ]);
        $cart = Cart::query()->create(['session_id' => session()->getId()]);
        CartItem::query()->create([
            'cart_id' => $cart->id,
            'event_id' => $event->id,
            'ticket_id' => $ticket->id,
            'quantity' => $quantity,
            'price' => $price,
        ]);
        $discountCode = DiscountCode::query()->create(['code' => $code, 'active' => true]);
        $discountCode->discounts()->create([
            'event_id' => $event->id,
            'ticket_id' => $ticket->id,
            'discount_type' => $type,
            'discount_value' => $value,
        ]);

        return [$cart, $ticket, $discountCode];
    }

    private function checkoutPayload(Cart $cart, Ticket $ticket, string|DiscountCode $discountCode, int $quantity = 1): array
    {
        $cartItem = $cart->items()->firstOrFail();

        return [
            'email' => 'buyer@example.com',
            'name' => 'Buyer',
            'payment_method' => 'bank_transfer',
            'discount_code' => $discountCode instanceof DiscountCode ? $discountCode->code : $discountCode,
            'ticket_guests' => [[
                'cart_item_id' => $cartItem->id,
                'guests' => array_fill(0, $quantity, ['name' => 'Guest']),
            ]],
            'cart_id' => $cart->id,
        ];
    }
}
