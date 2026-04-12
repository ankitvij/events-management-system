<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stripe_connect_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stripe_connected_account_id')->constrained('stripe_connected_accounts')->cascadeOnDelete();
            $table->foreignId('created_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('stripe_product_id')->unique();
            $table->string('stripe_price_id')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedInteger('unit_amount');
            $table->string('currency', 3)->default('usd');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stripe_connect_products');
    }
};
