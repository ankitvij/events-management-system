<?php

namespace App\Services;

use App\Models\StripeConnectProduct;
use RuntimeException;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class StripeConnectService
{
    /**
     * Build a Stripe client for all Stripe API requests in this service.
     *
     * The user asked for explicit placeholders. If the key is missing or still a
     * placeholder, we throw a clear error telling the developer exactly what to set.
     */
    protected function stripeClient(): StripeClient
    {
        $secretKey = (string) config('services.stripe.secret_key', '');
        if ($secretKey === '' || str_contains($secretKey, 'YOUR_STRIPE_SECRET_KEY_HERE')) {
            throw new RuntimeException('Stripe is not configured. Set STRIPE_SECRET_KEY in .env (for example: sk_test_...).');
        }

        // Use a StripeClient instance for all requests, as requested.
        $stripeClient = new StripeClient(['api_key' => $secretKey]);

        return $stripeClient;
    }

    /**
     * Create a connected account using Stripe Accounts v2 with the exact
     * property shape requested by the user.
     *
     * @return array<string, mixed>
     *
     * @throws ApiErrorException
     */
    public function createConnectedAccount(string $displayName, string $contactEmail, string $country = 'us'): array
    {
        $stripeClient = $this->stripeClient();

        return $stripeClient->v2->core->accounts->create([
            'display_name' => $displayName,
            'contact_email' => $contactEmail,
            'identity' => [
                'country' => strtolower($country),
            ],
            'dashboard' => 'express',
            'defaults' => [
                'responsibilities' => [
                    'fees_collector' => 'application',
                    'losses_collector' => 'application',
                ],
            ],
            'configuration' => [
                'recipient' => [
                    'capabilities' => [
                        'stripe_balance' => [
                            'stripe_transfers' => [
                                'requested' => true,
                            ],
                        ],
                    ],
                ],
            ],
        ]);
    }

    /**
     * Retrieve a connected account from Accounts v2 with includes needed for
     * onboarding and capability status.
     *
     * @return array<string, mixed>
     *
     * @throws ApiErrorException
     */
    public function retrieveConnectedAccount(string $accountId): array
    {
        $stripeClient = $this->stripeClient();

        return $stripeClient->v2->core->accounts->retrieve($accountId, [
            'include' => ['configuration.recipient', 'requirements'],
        ]);
    }

    /**
     * Create a v2 account onboarding link for a connected account.
     *
     * @return array<string, mixed>
     *
     * @throws ApiErrorException
     */
    public function createOnboardingLink(string $accountId, string $refreshUrl, string $returnUrl): array
    {
        $stripeClient = $this->stripeClient();

        return $stripeClient->v2->core->accountLinks->create([
            'account' => $accountId,
            'use_case' => [
                'type' => 'account_onboarding',
                'account_onboarding' => [
                    'configurations' => ['recipient'],
                    'refresh_url' => $refreshUrl,
                    'return_url' => $returnUrl,
                ],
            ],
        ]);
    }

    /**
     * Create a platform-level Stripe product and default price.
     *
     * @return array<string, mixed>
     *
     * @throws ApiErrorException
     */
    public function createPlatformProduct(string $name, ?string $description, int $priceInCents, string $currency): array
    {
        $stripeClient = $this->stripeClient();

        return $stripeClient->products->create([
            'name' => $name,
            'description' => $description,
            'default_price_data' => [
                'unit_amount' => $priceInCents,
                'currency' => strtolower($currency),
            ],
        ]);
    }

    /**
     * Create a hosted checkout session using destination charges.
     *
     * @return array<string, mixed>
     *
     * @throws ApiErrorException
     */
    public function createDestinationCheckoutSession(StripeConnectProduct $product, int $quantity, string $successUrl, string $cancelUrl): array
    {
        $stripeClient = $this->stripeClient();

        $applicationFeeBps = (int) config('services.stripe.connect_application_fee_bps', 1000);
        $applicationFeeAmount = (int) round($product->unit_amount * $quantity * ($applicationFeeBps / 10000));

        return $stripeClient->checkout->sessions->create([
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($product->currency),
                    'product' => $product->stripe_product_id,
                    'unit_amount' => $product->unit_amount,
                ],
                'quantity' => max(1, $quantity),
            ]],
            'payment_intent_data' => [
                'application_fee_amount' => $applicationFeeAmount,
                'transfer_data' => [
                    'destination' => $product->stripe_connected_account_id,
                ],
            ],
            'mode' => 'payment',
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
        ]);
    }

    /**
     * Parse a thin webhook event using the Stripe SDK helper and then retrieve
     * the full v2 event payload.
     *
     * @return array{thin_event: mixed, event: array<string, mixed>}
     *
     * @throws ApiErrorException
     */
    public function parseThinWebhookEvent(string $payload, string $signature): array
    {
        $stripeClient = $this->stripeClient();

        $webhookSecret = (string) config('services.stripe.connect_webhook_secret', '');
        if ($webhookSecret === '' || str_contains($webhookSecret, 'YOUR_STRIPE_CONNECT_WEBHOOK_SECRET_HERE')) {
            throw new RuntimeException('Stripe webhook secret is missing. Set STRIPE_CONNECT_WEBHOOK_SECRET in .env.');
        }

        if (! method_exists($stripeClient, 'parseThinEvent')) {
            throw new RuntimeException('This Stripe SDK build does not support parseThinEvent. Upgrade stripe/stripe-php to the latest version.');
        }

        $thinEvent = $stripeClient->parseThinEvent($payload, $signature, $webhookSecret);
        $event = $stripeClient->v2->core->events->retrieve($thinEvent['id']);

        return [
            'thin_event' => $thinEvent,
            'event' => $event,
        ];
    }
}
