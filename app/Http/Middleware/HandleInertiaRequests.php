<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $logoUrl = config('app.brand.logo_url');
        if (! $logoUrl) {
            $logoPath = ltrim((string) config('app.brand.logo_path'), '/');
            $logoUrl = asset($logoPath);
            $logoFilePath = public_path($logoPath);
            if (is_file($logoFilePath)) {
                $logoUrl .= '?v='.filemtime($logoFilePath);
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'brand' => [
                'logo_url' => $logoUrl,
                'logo_alt' => config('app.brand.logo_alt'),
            ],
            'auth' => [
                'user' => $request->user(),
            ],
            'customer' => (function () use ($request) {
                $id = $request->session()->get('customer_id');
                if (! $id) {
                    return null;
                }
                $c = \App\Models\Customer::find($id);
                if (! $c) {
                    return null;
                }

                return ['id' => $c->id, 'name' => $c->name, 'email' => $c->email];
            })(),
            'artist' => (function () use ($request) {
                $id = $request->session()->get('artist_id');
                if (! $id) {
                    return null;
                }

                $artist = \App\Models\Artist::query()->find($id);
                if (! $artist) {
                    return null;
                }

                return ['id' => $artist->id, 'name' => $artist->name, 'email' => $artist->email];
            })(),
            'vendor' => (function () use ($request) {
                $id = $request->session()->get('vendor_id');
                if (! $id) {
                    return null;
                }

                $vendor = \App\Models\Vendor::query()->find($id);
                if (! $vendor) {
                    return null;
                }

                return ['id' => $vendor->id, 'name' => $vendor->name, 'email' => $vendor->email];
            })(),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'ticketScan' => $request->session()->get('ticketScan'),
                'newsletter_success' => $request->session()->get('newsletter_success'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
