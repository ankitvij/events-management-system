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
        Schema::create('module_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('agencies_enabled')->default(true);
            $table->boolean('organisers_enabled')->default(true);
            $table->boolean('artists_enabled')->default(true);
            $table->boolean('promoters_enabled')->default(true);
            $table->boolean('vendors_enabled')->default(true);
            $table->boolean('venues_enabled')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('module_settings');
    }
};
