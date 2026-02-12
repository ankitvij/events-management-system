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
        if (Schema::hasColumn('login_tokens', 'artist_id')) {
            return;
        }

        Schema::table('login_tokens', function (Blueprint $table) {
            $table->unsignedBigInteger('artist_id')->nullable()->index()->after('customer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('login_tokens', 'artist_id')) {
            return;
        }

        Schema::table('login_tokens', function (Blueprint $table) {
            $table->dropColumn('artist_id');
        });
    }
};
