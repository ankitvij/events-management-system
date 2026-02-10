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
            $table->string('bank_account_name')->nullable()->after('email');
            $table->string('bank_iban')->nullable()->after('bank_account_name');
            $table->string('bank_bic')->nullable()->after('bank_iban');
            $table->string('bank_reference_hint')->nullable()->after('bank_bic');
            $table->text('bank_instructions')->nullable()->after('bank_reference_hint');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organisers', function (Blueprint $table) {
            $table->dropColumn(['bank_account_name', 'bank_iban', 'bank_bic', 'bank_reference_hint', 'bank_instructions']);
        });
    }
};
