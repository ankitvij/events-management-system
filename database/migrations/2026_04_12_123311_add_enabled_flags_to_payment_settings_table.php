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
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->boolean('bank_enabled')->nullable()->after('bank_instructions');
            $table->boolean('paypal_enabled')->nullable()->after('paypal_instructions');
            $table->boolean('revolut_enabled')->nullable()->after('revolut_instructions');
            $table->boolean('stripe_enabled')->nullable()->after('stripe_instructions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->dropColumn([
                'bank_enabled',
                'paypal_enabled',
                'revolut_enabled',
                'stripe_enabled',
            ]);
        });
    }
};
