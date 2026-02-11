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
        Schema::create('payment_settings', function (Blueprint $table) {
            $table->id();
            $table->string('bank_account_name', 255)->nullable();
            $table->string('bank_iban', 64)->nullable();
            $table->string('bank_bic', 64)->nullable();
            $table->string('bank_reference_hint', 255)->nullable();
            $table->string('bank_instructions', 1000)->nullable();
            $table->string('paypal_id', 255)->nullable();
            $table->string('paypal_instructions', 1000)->nullable();
            $table->string('revolut_id', 255)->nullable();
            $table->string('revolut_instructions', 1000)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_settings');
    }
};
