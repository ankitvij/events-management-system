<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\DiscountCode;
use App\Models\Event;
use App\Models\Organiser;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiscountCodeModuleTest extends TestCase
{
    use RefreshDatabase;

    public function test_promoter_can_create_unique_discount_code_for_self(): void
    {
        $promoter = User::factory()->create([
            'role' => Role::USER->value,
            'is_super_admin' => false,
            'active' => true,
        ]);

        $event = Event::factory()->create();
        $event->promoters()->sync([$promoter->id]);

        $ticket = Ticket::query()->create([
            'event_id' => $event->id,
            'name' => 'Promo Ticket',
            'price' => 50,
            'quantity_total' => 50,
            'quantity_available' => 50,
            'active' => true,
        ]);

        $response = $this->actingAs($promoter)->post('/discount-codes', [
            'code' => 'PROMO50',
            'discounts' => [
                [
                    'event_id' => $event->id,
                    'ticket_id' => $ticket->id,
                    'discount_type' => 'percentage',
                    'discount_value' => 10,
                ],
            ],
        ]);

        $response->assertRedirect('/discount-codes');

        $this->assertDatabaseHas('discount_codes', [
            'code' => 'PROMO50',
            'promoter_user_id' => $promoter->id,
            'created_by_user_id' => $promoter->id,
        ]);

        $discountCode = DiscountCode::query()->where('code', 'PROMO50')->firstOrFail();
        $this->assertDatabaseHas('discount_code_tickets', [
            'discount_code_id' => $discountCode->id,
            'event_id' => $event->id,
            'ticket_id' => $ticket->id,
            'discount_type' => 'percentage',
            'discount_value' => '10.00',
        ]);
    }

    public function test_organiser_can_create_discount_code_assign_promoter_and_ticket_discount(): void
    {
        $organiserUser = User::factory()->create([
            'role' => Role::USER->value,
            'is_super_admin' => false,
            'active' => true,
            'email' => 'organiser-owner@example.test',
        ]);

        $organiser = Organiser::query()->create([
            'name' => 'Org Owner',
            'email' => 'organiser-owner@example.test',
            'active' => true,
        ]);

        $promoter = User::factory()->create([
            'role' => Role::USER->value,
            'is_super_admin' => false,
            'active' => true,
        ]);

        $event = Event::factory()->create([
            'organiser_id' => $organiser->id,
        ]);
        $event->organisers()->sync([$organiser->id]);
        $event->promoters()->sync([$promoter->id]);

        $ticket = Ticket::query()->create([
            'event_id' => $event->id,
            'name' => 'Org Ticket',
            'price' => 40,
            'quantity_total' => 50,
            'quantity_available' => 50,
            'active' => true,
        ]);

        $response = $this->actingAs($organiserUser)->post('/discount-codes', [
            'code' => 'ORG15',
            'promoter_user_id' => $promoter->id,
            'discounts' => [
                [
                    'event_id' => $event->id,
                    'ticket_id' => $ticket->id,
                    'discount_type' => 'euro',
                    'discount_value' => 5,
                ],
            ],
        ]);

        $response->assertRedirect('/discount-codes');

        $this->assertDatabaseHas('discount_codes', [
            'code' => 'ORG15',
            'promoter_user_id' => $promoter->id,
            'organiser_id' => $organiser->id,
            'created_by_user_id' => $organiserUser->id,
        ]);
    }

    public function test_organiser_cannot_assign_promoter_not_linked_to_event(): void
    {
        $organiserUser = User::factory()->create([
            'role' => Role::USER->value,
            'is_super_admin' => false,
            'active' => true,
            'email' => 'organiser-owner@example.test',
        ]);

        $organiser = Organiser::query()->create([
            'name' => 'Org Owner',
            'email' => 'organiser-owner@example.test',
            'active' => true,
        ]);

        $event = Event::factory()->create([
            'organiser_id' => $organiser->id,
        ]);
        $event->organisers()->sync([$organiser->id]);

        $ticket = Ticket::query()->create([
            'event_id' => $event->id,
            'name' => 'Org Ticket',
            'price' => 40,
            'quantity_total' => 50,
            'quantity_available' => 50,
            'active' => true,
        ]);

        $unlinkedPromoter = User::factory()->create([
            'role' => Role::USER->value,
            'is_super_admin' => false,
            'active' => true,
        ]);

        $response = $this->actingAs($organiserUser)->post('/discount-codes', [
            'code' => 'BADPROMO',
            'promoter_user_id' => $unlinkedPromoter->id,
            'discounts' => [
                [
                    'event_id' => $event->id,
                    'ticket_id' => $ticket->id,
                    'discount_type' => 'percentage',
                    'discount_value' => 20,
                ],
            ],
        ]);

        $response->assertStatus(422);
    }

    public function test_promoter_cannot_create_discount_code_for_another_promoter(): void
    {
        $promoter = User::factory()->create([
            'role' => Role::USER->value,
            'is_super_admin' => false,
            'active' => true,
        ]);
        $otherPromoter = User::factory()->create([
            'role' => Role::USER->value,
            'is_super_admin' => false,
            'active' => true,
        ]);

        $event = Event::factory()->create();
        $event->promoters()->sync([$promoter->id]);

        $ticket = Ticket::query()->create([
            'event_id' => $event->id,
            'name' => 'Promo Ticket',
            'price' => 20,
            'quantity_total' => 20,
            'quantity_available' => 20,
            'active' => true,
        ]);

        $response = $this->actingAs($promoter)->post('/discount-codes', [
            'code' => 'NOPE123',
            'promoter_user_id' => $otherPromoter->id,
            'discounts' => [
                [
                    'event_id' => $event->id,
                    'ticket_id' => $ticket->id,
                    'discount_type' => 'euro',
                    'discount_value' => 5,
                ],
            ],
        ]);

        $response->assertStatus(403);
    }

    public function test_discount_code_must_be_unique(): void
    {
        $promoter = User::factory()->create([
            'role' => Role::USER->value,
            'is_super_admin' => false,
            'active' => true,
        ]);

        $event = Event::factory()->create();
        $event->promoters()->sync([$promoter->id]);

        $ticket = Ticket::query()->create([
            'event_id' => $event->id,
            'name' => 'Promo Ticket',
            'price' => 20,
            'quantity_total' => 20,
            'quantity_available' => 20,
            'active' => true,
        ]);

        $this->actingAs($promoter)->post('/discount-codes', [
            'code' => 'UNIQUE01',
            'discounts' => [
                [
                    'event_id' => $event->id,
                    'ticket_id' => $ticket->id,
                    'discount_type' => 'percentage',
                    'discount_value' => 10,
                ],
            ],
        ])->assertRedirect('/discount-codes');

        $response = $this->actingAs($promoter)->post('/discount-codes', [
            'code' => 'UNIQUE01',
            'discounts' => [
                [
                    'event_id' => $event->id,
                    'ticket_id' => $ticket->id,
                    'discount_type' => 'percentage',
                    'discount_value' => 10,
                ],
            ],
        ]);

        $response->assertSessionHasErrors('code');
    }
}
