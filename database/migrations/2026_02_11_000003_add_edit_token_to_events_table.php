<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table): void {
            $table->string('edit_token', 128)->nullable()->unique()->after('organiser_id');
            $table->timestamp('edit_token_expires_at')->nullable()->after('edit_token');
            $table->string('edit_password')->nullable()->after('edit_token_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table): void {
            $table->dropColumn(['edit_token', 'edit_token_expires_at', 'edit_password']);
        });
    }
};
