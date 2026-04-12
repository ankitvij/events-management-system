<?php

namespace App\Http\Controllers;

use App\Models\StripeConnectedAccount;
use App\Models\StripeConnectProduct;
use App\Services\StripeConnectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;

class StripeConnectController extends Controller
{
    /**
     * Show a simple admin/demo page for Stripe Connect onboarding + products.
     */
    public function dashboard(Request $request, StripeConnectService $stripeConnectService)
    {
        $user = $request->user();
        $connectedAccount = $user?->stripeConnectedAccount;
        $accountStatus = null;
        $statusError = null;

        // Per requirement, always fetch onboarding/capability status directly from Stripe API.
        if ($connectedAccount) {
            try {
                $account = $stripeConnectService->retrieveConnectedAccount($connectedAccount->stripe_account_id);

                $readyToReceivePayments = ($account['configuration']['recipient']['capabilities']['stripe_balance']['stripe_transfers']['status'] ?? null) === 'active';
                $requirementsStatus = $account['requirements']['summary']['minimum_deadline']['status'] ?? null;
                $onboardingComplete = $requirementsStatus !== 'currently_due' && $requirementsStatus !== 'past_due';

                $accountStatus = [
                    'stripe_account_id' => $connectedAccount->stripe_account_id,
                    'ready_to_receive_payments' => $readyToReceivePayments,
                    'requirements_status' => $requirementsStatus,
                    'onboarding_complete' => $onboardingComplete,
                ];
            } catch (\Throwable $e) {
                $statusError = $e->getMessage();
            }
        }

        $products = StripeConnectProduct::query()
            ->with('connectedAccount.user:id,name,email')
            ->latest()
            ->get();

        return view('stripe.connect', [
            'connectedAccount' => $connectedAccount,
            'accountStatus' => $accountStatus,
            'statusError' => $statusError,
            'products' => $products,
        ]);
    }

    /**
     * Create a Stripe connected account (v2 API) and save mapping to current user.
     */
    public function createConnectedAccount(Request $request, StripeConnectService $stripeConnectService)
    {
        $validated = $request->validate([
            'display_name' => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'country' => ['required', 'string', 'size:2'],
        ]);

        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        if ($user->stripeConnectedAccount) {
            return redirect()->route('stripe.connect.dashboard')->with('error', 'A connected account is already linked to this user.');
        }

        try {
            $account = $stripeConnectService->createConnectedAccount(
                displayName: $validated['display_name'],
                contactEmail: $validated['contact_email'],
                country: $validated['country']
            );

            StripeConnectedAccount::create([
                'user_id' => $user->id,
                'stripe_account_id' => $account['id'],
                'country' => strtolower($validated['country']),
            ]);
        } catch (ApiErrorException $e) {
            return redirect()->route('stripe.connect.dashboard')->with('error', 'Stripe account creation failed: '.$e->getMessage());
        } catch (\Throwable $e) {
            return redirect()->route('stripe.connect.dashboard')->with('error', $e->getMessage());
        }

        return redirect()->route('stripe.connect.dashboard')->with('success', 'Connected account created successfully.');
    }

    /**
     * Generate a Stripe onboarding link and redirect user to Stripe-hosted onboarding.
     */
    public function createOnboardingLink(Request $request, StripeConnectService $stripeConnectService)
    {
        $user = $request->user();
        $connectedAccount = $user?->stripeConnectedAccount;

        if (! $connectedAccount) {
            return redirect()->route('stripe.connect.dashboard')->with('error', 'Create a connected account first.');
        }

        $refreshUrl = route('stripe.connect.dashboard', [], true);
        $returnUrl = route('stripe.connect.dashboard', ['accountId' => $connectedAccount->stripe_account_id], true);

        try {
            $accountLink = $stripeConnectService->createOnboardingLink(
                accountId: $connectedAccount->stripe_account_id,
                refreshUrl: $refreshUrl,
                returnUrl: $returnUrl
            );
        } catch (ApiErrorException $e) {
            return redirect()->route('stripe.connect.dashboard')->with('error', 'Could not create onboarding link: '.$e->getMessage());
        } catch (\Throwable $e) {
            return redirect()->route('stripe.connect.dashboard')->with('error', $e->getMessage());
        }

        return redirect()->away($accountLink['url']);
    }

    /**
     * Create a platform-level Stripe product and map it to a connected account.
     */
    public function createProduct(Request $request, StripeConnectService $stripeConnectService)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'unit_amount' => ['required', 'integer', 'min:50'],
            'currency' => ['required', 'string', 'size:3'],
            'stripe_connected_account_id' => ['required', 'exists:stripe_connected_accounts,id'],
        ]);

        $connectedAccount = StripeConnectedAccount::query()->findOrFail($validated['stripe_connected_account_id']);

        try {
            $product = $stripeConnectService->createPlatformProduct(
                name: $validated['name'],
                description: $validated['description'] ?? null,
                priceInCents: (int) $validated['unit_amount'],
                currency: $validated['currency']
            );

            StripeConnectProduct::create([
                'stripe_connected_account_id' => $connectedAccount->id,
                'created_by_user_id' => $request->user()->id,
                'stripe_product_id' => $product['id'],
                'stripe_price_id' => is_array($product['default_price'] ?? null)
                    ? ($product['default_price']['id'] ?? null)
                    : ($product['default_price'] ?? null),
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'unit_amount' => (int) $validated['unit_amount'],
                'currency' => strtolower($validated['currency']),
            ]);
        } catch (ApiErrorException $e) {
            return redirect()->route('stripe.connect.dashboard')->with('error', 'Stripe product creation failed: '.$e->getMessage());
        } catch (\Throwable $e) {
            return redirect()->route('stripe.connect.dashboard')->with('error', $e->getMessage());
        }

        return redirect()->route('stripe.connect.dashboard')->with('success', 'Product created and mapped successfully.');
    }

    /**
     * Public storefront showing all mapped products across all connected accounts.
     */
    public function storefront()
    {
        $products = StripeConnectProduct::query()
            ->with('connectedAccount.user:id,name')
            ->latest()
            ->get();

        return view('stripe.storefront', [
            'products' => $products,
        ]);
    }

    /**
     * Create a hosted checkout session for a destination charge and redirect.
     */
    public function purchase(Request $request, StripeConnectProduct $product, StripeConnectService $stripeConnectService)
    {
        $validated = $request->validate([
            'quantity' => ['nullable', 'integer', 'min:1', 'max:25'],
        ]);

        $quantity = (int) ($validated['quantity'] ?? 1);

        $successUrl = route('stripe.connect.storefront.success', [], true).'?session_id={CHECKOUT_SESSION_ID}';
        $cancelUrl = route('stripe.connect.storefront', [], true);

        try {
            $session = $stripeConnectService->createDestinationCheckoutSession(
                product: $product,
                quantity: $quantity,
                successUrl: $successUrl,
                cancelUrl: $cancelUrl
            );
        } catch (ApiErrorException $e) {
            return redirect()->route('stripe.connect.storefront')->with('error', 'Checkout creation failed: '.$e->getMessage());
        } catch (\Throwable $e) {
            return redirect()->route('stripe.connect.storefront')->with('error', $e->getMessage());
        }

        return redirect()->away($session['url']);
    }

    public function storefrontSuccess(Request $request)
    {
        $sessionId = $request->query('session_id');

        return view('stripe.success', [
            'sessionId' => $sessionId,
        ]);
    }

    /**
     * Handle thin Stripe webhook events for account requirements/capabilities.
     */
    public function webhook(Request $request, StripeConnectService $stripeConnectService)
    {
        $signature = (string) $request->header('Stripe-Signature', '');
        if ($signature === '') {
            return response()->json(['error' => 'Missing Stripe-Signature header.'], 400);
        }

        try {
            $parsed = $stripeConnectService->parseThinWebhookEvent($request->getContent(), $signature);
            $event = $parsed['event'];
            $eventType = (string) ($event['type'] ?? '');

            if ($eventType === 'v2.core.account[requirements].updated') {
                Log::info('Stripe Connect requirements updated.', ['event' => $event]);
            }

            if (str_contains($eventType, 'capability_status_updated')) {
                Log::info('Stripe Connect capability status updated.', ['event' => $event]);
            }

            return response()->json(['received' => true]);
        } catch (\Throwable $e) {
            Log::error('Stripe Connect webhook handling failed.', ['message' => $e->getMessage()]);

            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
