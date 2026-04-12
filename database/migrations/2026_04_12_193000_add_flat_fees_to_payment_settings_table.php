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
            $table->decimal('bank_flat_fee', 8, 2)->nullable()->after('bank_enabled');
            $table->decimal('paypal_flat_fee', 8, 2)->nullable()->after('paypal_enabled');
            $table->decimal('revolut_flat_fee', 8, 2)->nullable()->after('revolut_enabled');
            $table->decimal('stripe_flat_fee', 8, 2)->nullable()->after('stripe_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->dropColumn([
                'bank_flat_fee',
                'paypal_flat_fee',
                'revolut_flat_fee',
                'stripe_flat_fee',
            ]);
        });
    }
};
