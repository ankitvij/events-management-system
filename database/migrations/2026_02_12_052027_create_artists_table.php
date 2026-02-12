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
        Schema::create('artists', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('email')->unique();
            $table->string('city');
            $table->unsignedSmallInteger('experience_years')->default(0);
            $table->text('skills');
            $table->text('description')->nullable();
            $table->text('equipment')->nullable();
            $table->string('photo');

            $table->boolean('active')->default(false);
            $table->timestamp('email_verified_at')->nullable();
            $table->string('verify_token', 64)->nullable()->index();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('artists');
    }
};
