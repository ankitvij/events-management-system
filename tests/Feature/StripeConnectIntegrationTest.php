<?php

namespace Tests\Feature;

use App\Models\StripeConnectedAccount;
use App\Models\StripeConnectProduct;
use App\Models\User;
use App\Services\StripeConnectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class StripeConnectIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_requires_authentication(): void
    {
        $response = $this->get(route('stripe.connect.dashboard'));

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_dashboard(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('stripe.connect.dashboard'));

        $response->assertOk()->assertSee('Stripe Connect Sample');
    }

    public function test_create_connected_account_stores_user_mapping(): void
    {
        $user = User::factory()->create();

        $mock = Mockery::mock(StripeConnectService::class);
        $mock->shouldReceive('createConnectedAccount')
            ->once()
            ->andReturn(['id' => 'acct_test_123']);
        $this->app->instance(StripeConnectService::class, $mock);

        $response = $this->actingAs($user)->post(route('stripe.connect.account.create'), [
            'display_name' => 'Demo Merchant',
            'contact_email' => 'merchant@example.com',
            'country' => 'US',
        ]);

        $response->assertRedirect(route('stripe.connect.dashboard'));

        $this->assertDatabaseHas('stripe_connected_accounts', [
            'user_id' => $user->id,
            'stripe_account_id' => 'acct_test_123',
            'country' => 'us',
        ]);
    }

    public function test_create_product_stores_mapping(): void
    {
        $user = User::factory()->create();
        $mapping = StripeConnectedAccount::create([
            'user_id' => $user->id,
            'stripe_account_id' => 'acct_test_abc',
            'country' => 'us',
        ]);

        $mock = Mockery::mock(StripeConnectService::class);
        $mock->shouldReceive('createPlatformProduct')
            ->once()
            ->andReturn([
                'id' => 'prod_test_123',
                'default_price' => 'price_test_123',
            ]);
        $this->app->instance(StripeConnectService::class, $mock);

        $response = $this->actingAs($user)->post(route('stripe.connect.products.create'), [
            'name' => 'Demo Product',
            'description' => 'Simple demo',
            'unit_amount' => 2500,
            'currency' => 'usd',
            'stripe_connected_account_id' => $mapping->id,
        ]);

        $response->assertRedirect(route('stripe.connect.dashboard'));

        $this->assertDatabaseHas('stripe_connect_products', [
            'stripe_connected_account_id' => $mapping->id,
            'created_by_user_id' => $user->id,
            'stripe_product_id' => 'prod_test_123',
            'stripe_price_id' => 'price_test_123',
            'unit_amount' => 2500,
            'currency' => 'usd',
        ]);
    }

    public function test_purchase_redirects_to_hosted_checkout(): void
    {
        $user = User::factory()->create();
        $mapping = StripeConnectedAccount::create([
            'user_id' => $user->id,
            'stripe_account_id' => 'acct_test_checkout',
            'country' => 'us',
        ]);
        $product = StripeConnectProduct::create([
            'stripe_connected_account_id' => $mapping->id,
            'created_by_user_id' => $user->id,
            'stripe_product_id' => 'prod_checkout',
            'stripe_price_id' => 'price_checkout',
            'name' => 'Checkout Product',
            'description' => null,
            'unit_amount' => 1000,
            'currency' => 'usd',
        ]);

        $mock = Mockery::mock(StripeConnectService::class);
        $mock->shouldReceive('createDestinationCheckoutSession')
            ->once()
            ->andReturn(['url' => 'https://checkout.stripe.com/c/pay/test_session']);
        $this->app->instance(StripeConnectService::class, $mock);

        $response = $this->post(route('stripe.connect.storefront.purchase', $product), [
            'quantity' => 2,
        ]);

        $response->assertRedirect('https://checkout.stripe.com/c/pay/test_session');
    }

    public function test_webhook_returns_error_when_signature_header_missing(): void
    {
        $response = $this->post(route('stripe.connect.webhook'), []);

        $response->assertStatus(400)
            ->assertJsonPath('error', 'Missing Stripe-Signature header.');
    }
}
