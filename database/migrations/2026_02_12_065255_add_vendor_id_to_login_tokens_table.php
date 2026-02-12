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
        if (Schema::hasColumn('login_tokens', 'vendor_id')) {
            return;
        }

        Schema::table('login_tokens', function (Blueprint $table) {
            $table->unsignedBigInteger('vendor_id')->nullable()->index()->after('artist_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('login_tokens', 'vendor_id')) {
            return;
        }

        Schema::table('login_tokens', function (Blueprint $table) {
            $table->dropColumn('vendor_id');
        });
    }
};
