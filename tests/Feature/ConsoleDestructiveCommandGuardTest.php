<?php

namespace Tests\Feature;

use Illuminate\Console\Events\CommandStarting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\NullOutput;
use Tests\TestCase;

class ConsoleDestructiveCommandGuardTest extends TestCase
{
    use RefreshDatabase;

    public function test_destructive_commands_are_blocked_in_production(): void
    {
        $this->app->detectEnvironment(fn () => 'production');
        config(['app.env' => 'production']);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Destructive command');

        Event::dispatch(new CommandStarting('migrate:fresh', new ArrayInput([]), new NullOutput));
    }

    public function test_non_destructive_commands_are_allowed_in_production(): void
    {
        $this->app->detectEnvironment(fn () => 'production');
        config(['app.env' => 'production']);

        Event::dispatch(new CommandStarting('list', new ArrayInput([]), new NullOutput));

        $this->assertTrue(true);
    }
}
