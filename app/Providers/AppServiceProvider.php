<?php

namespace App\Providers;

use App\Listeners\LogFailedMail;
use App\Models\Artist;
use App\Models\Customer;
use App\Models\Organiser;
use App\Models\User;
use App\Policies\ArtistPolicy;
use App\Policies\CustomerPolicy;
use App\Policies\OrganiserPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Console\Events\CommandStarting;
use Illuminate\Mail\Events\MessageFailed;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->prohibitDestructiveArtisanCommands();

        config(['dompdf.public_path' => base_path('public_html')]);

        // Register mail failure logger so bounces/rejections are recorded
        Event::listen(MessageFailed::class, [LogFailedMail::class, 'handle']);

        Gate::policy(Organiser::class, OrganiserPolicy::class);
        Gate::policy(Customer::class, CustomerPolicy::class);
        Gate::policy(Artist::class, ArtistPolicy::class);

        Gate::define('access-pages', function (User $user) {
            return $user->hasRole(['user', 'admin']);
        });
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }

    protected function prohibitDestructiveArtisanCommands(): void
    {
        Event::listen(CommandStarting::class, function (CommandStarting $event) {
            if (! app()->isProduction()) {
                return;
            }

            $blocked = [
                'migrate:fresh',
                'migrate:refresh',
                'migrate:rollback',
                'db:wipe',
            ];

            if (! in_array($event->command, $blocked, true)) {
                return;
            }

            if ($event->input->hasParameterOption('--force', true)) {
                return;
            }

            throw new \RuntimeException("Destructive command [{$event->command}] is blocked in production. Use --force to override.");
        });
    }
}
