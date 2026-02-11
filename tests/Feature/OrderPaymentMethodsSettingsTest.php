<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\PaymentSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrderPaymentMethodsSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_view_payment_methods_settings(): void
    {
        $user = User::factory()->create([
            'role' => Role::SUPER_ADMIN,
            'is_super_admin' => true,
        ]);

        $this->actingAs($user)
            ->get(route('orders.payment-methods.edit'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Orders/PaymentMethods')
                ->has('payment_settings')
            );
    }

    public function test_non_super_admin_cannot_view_payment_methods_settings(): void
    {
        $user = User::factory()->create([
            'role' => Role::ADMIN,
            'is_super_admin' => false,
        ]);

        $this->actingAs($user)
            ->get(route('orders.payment-methods.edit'))
            ->assertForbidden();
    }

    public function test_super_admin_can_update_payment_methods_settings(): void
    {
        $user = User::factory()->create([
            'role' => Role::SUPER_ADMIN,
            'is_super_admin' => true,
        ]);

        $payload = [
            'bank_account_name' => 'Global Bank',
            'bank_iban' => 'GB55BANK00000000012345',
            'bank_bic' => 'BANKGB2L',
            'bank_reference_hint' => 'Use booking code',
            'bank_instructions' => 'Pay within 7 days',
            'paypal_id' => 'paypal@example.com',
            'paypal_instructions' => 'Send via PayPal',
            'revolut_id' => 'revolut-id',
            'revolut_instructions' => 'Send via Revolut',
        ];

        $this->actingAs($user)
            ->put(route('orders.payment-methods.update'), $payload)
            ->assertRedirect(route('orders.payment-methods.edit'));

        $settings = PaymentSetting::query()->first();
        $this->assertNotNull($settings);
        $this->assertSame('Global Bank', $settings->bank_account_name);
        $this->assertSame('paypal@example.com', $settings->paypal_id);
        $this->assertSame('revolut-id', $settings->revolut_id);
    }
}
