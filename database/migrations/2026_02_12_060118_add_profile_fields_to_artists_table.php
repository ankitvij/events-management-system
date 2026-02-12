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
        if (! Schema::hasColumn('artists', 'name')) {
            Schema::table('artists', function (Blueprint $table) {
                $table->string('name')->nullable();
            });
        }

        if (! Schema::hasColumn('artists', 'email')) {
            Schema::table('artists', function (Blueprint $table) {
                $table->string('email')->nullable()->index();
            });
        }

        if (! Schema::hasColumn('artists', 'city')) {
            Schema::table('artists', function (Blueprint $table) {
                $table->string('city', 100)->nullable();
            });
        }

        if (! Schema::hasColumn('artists', 'experience_years')) {
            Schema::table('artists', function (Blueprint $table) {
                $table->unsignedInteger('experience_years')->default(0);
            });
        }

        if (! Schema::hasColumn('artists', 'skills')) {
            Schema::table('artists', function (Blueprint $table) {
                $table->text('skills')->nullable();
            });
        }

        if (! Schema::hasColumn('artists', 'description')) {
            Schema::table('artists', function (Blueprint $table) {
                $table->text('description')->nullable();
            });
        }

        if (! Schema::hasColumn('artists', 'equipment')) {
            Schema::table('artists', function (Blueprint $table) {
                $table->text('equipment')->nullable();
            });
        }

        if (! Schema::hasColumn('artists', 'photo')) {
            Schema::table('artists', function (Blueprint $table) {
                $table->string('photo')->nullable();
            });
        }

        if (! Schema::hasColumn('artists', 'active')) {
            Schema::table('artists', function (Blueprint $table) {
                $table->boolean('active')->default(false)->index();
            });
        }

        if (! Schema::hasColumn('artists', 'email_verified_at')) {
            Schema::table('artists', function (Blueprint $table) {
                $table->timestamp('email_verified_at')->nullable()->index();
            });
        }

        if (! Schema::hasColumn('artists', 'verify_token')) {
            Schema::table('artists', function (Blueprint $table) {
                $table->string('verify_token', 64)->nullable()->index();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $columns = [
            'verify_token',
            'email_verified_at',
            'active',
            'photo',
            'equipment',
            'description',
            'skills',
            'experience_years',
            'city',
            'email',
            'name',
        ];

        foreach ($columns as $col) {
            if (Schema::hasColumn('artists', $col)) {
                Schema::table('artists', function (Blueprint $table) use ($col) {
                    $table->dropColumn($col);
                });
            }
        }
    }
};
