<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organisers', function (Blueprint $table) {
            $table->string('paypal_id', 255)->nullable()->after('bank_instructions');
            $table->string('revolut_id', 255)->nullable()->after('paypal_id');
        });
    }

    public function down(): void
    {
        Schema::table('organisers', function (Blueprint $table) {
            $table->dropColumn([
                'paypal_id',
                'revolut_id',
            ]);
        });
    }
};
