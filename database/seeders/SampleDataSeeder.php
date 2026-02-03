<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Organiser;
use App\Models\Customer;
use App\Models\Page;

class SampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        User::truncate();
        Organiser::truncate();
        Customer::truncate();
        Page::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Users: regular, admin, super admin
        User::factory()->create([
            'name' => 'Regular User',
            'email' => 'user@example.test',
            'role' => 'user',
            'is_super_admin' => false,
        ]);

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.test',
            'role' => 'admin',
            'is_super_admin' => false,
        ]);

        User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'super@example.test',
            'role' => 'super_admin',
            'is_super_admin' => true,
        ]);

        // Additional demo users
        User::factory()->count(3)->sequence(
            ['name' => 'Alice Example', 'email' => 'alice@example.test'],
            ['name' => 'Bob Example', 'email' => 'bob@example.test'],
            ['name' => 'Carol Example', 'email' => 'carol@example.test']
        )->create();

        // Organisers (add base + more)
        Organiser::create(['name' => 'Acme Events', 'email' => 'acme@example.test', 'active' => true]);
        Organiser::create(['name' => 'Festival Co', 'email' => 'festival@example.test', 'active' => true]);
        Organiser::create(['name' => 'Conference Org', 'email' => 'conf@example.test', 'active' => true]);
        for ($i = 1; $i <= 10; $i++) {
            Organiser::create([
                'name' => "Demo Organiser {$i}",
                'email' => "organiser{$i}@example.test",
                'active' => true,
            ]);
        }

        // Customers (add base + more)
        Customer::create(['name' => 'Acme Corp', 'email' => 'cust1@example.test', 'phone' => '555-0101']);
        Customer::create(['name' => 'Beta LLC', 'email' => 'cust2@example.test', 'phone' => '555-0202']);
        for ($i = 1; $i <= 10; $i++) {
            Customer::create([
                'name' => "Demo Customer {$i}",
                'email' => "customer{$i}@example.test",
                'phone' => sprintf('555-%04d', 3000 + $i),
            ]);
        }

        // Pages (assign to first user) - base + more
        $ownerId = optional(User::first())->id ?? null;
        Page::create(['slug' => 'about', 'title' => 'About Us', 'content' => 'About page content for demo.', 'active' => true, 'user_id' => $ownerId]);
        Page::create(['slug' => 'terms', 'title' => 'Terms & Conditions', 'content' => 'Terms and conditions placeholder.', 'active' => true, 'user_id' => $ownerId]);
        Page::create(['slug' => 'privacy', 'title' => 'Privacy Policy', 'content' => 'Privacy policy placeholder.', 'active' => true, 'user_id' => $ownerId]);
        for ($i = 1; $i <= 10; $i++) {
            Page::create([
                'slug' => "demo-page-{$i}",
                'title' => "Demo Page {$i}",
                'content' => "Demo page {$i} content.",
                'active' => true,
                'user_id' => $ownerId,
            ]);
        }

        // Additional users (~10) with mixed roles
        User::factory()->count(10)->sequence(
            ['name' => 'Demo User 1', 'email' => 'demo1@example.test', 'role' => 'user', 'is_super_admin' => false],
            ['name' => 'Demo User 2', 'email' => 'demo2@example.test', 'role' => 'user', 'is_super_admin' => false],
            ['name' => 'Demo User 3', 'email' => 'demo3@example.test', 'role' => 'admin', 'is_super_admin' => false],
            ['name' => 'Demo User 4', 'email' => 'demo4@example.test', 'role' => 'admin', 'is_super_admin' => false],
            ['name' => 'Demo User 5', 'email' => 'demo5@example.test', 'role' => 'user', 'is_super_admin' => false],
            ['name' => 'Demo User 6', 'email' => 'demo6@example.test', 'role' => 'user', 'is_super_admin' => false],
            ['name' => 'Demo User 7', 'email' => 'demo7@example.test', 'role' => 'user', 'is_super_admin' => false],
            ['name' => 'Demo Admin 8', 'email' => 'demo8@example.test', 'role' => 'admin', 'is_super_admin' => false],
            ['name' => 'Demo Super 9', 'email' => 'demo9@example.test', 'role' => 'super_admin', 'is_super_admin' => true],
            ['name' => 'Demo User 10', 'email' => 'demo10@example.test', 'role' => 'user', 'is_super_admin' => false],
        )->create();
    }
}
