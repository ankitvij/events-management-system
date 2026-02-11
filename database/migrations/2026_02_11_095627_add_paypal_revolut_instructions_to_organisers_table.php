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
        Schema::table('organisers', function (Blueprint $table) {
            $table->string('paypal_instructions', 1000)->nullable()->after('paypal_id');
            $table->string('revolut_instructions', 1000)->nullable()->after('revolut_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organisers', function (Blueprint $table) {
            $table->dropColumn(['paypal_instructions', 'revolut_instructions']);
        });
    }
};
