<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Backfill any existing orders missing a booking_code
        DB::table('orders')->whereNull('booking_code')->orderBy('id')->chunk(100, function ($orders) {
            foreach ($orders as $o) {
                do {
                    try {
                        $code = (string) random_int(1000000000, 9999999999);
                    } catch (\Throwable $e) {
                        $code = substr((string) time() . (string) rand(1000, 9999), 0, 10);
                    }
                } while (DB::table('orders')->where('booking_code', $code)->exists());

                DB::table('orders')->where('id', $o->id)->update(['booking_code' => $code]);
            }
        });

        // Alter column to make it non-nullable (do not wrap in DB transaction to avoid nested transaction issues)
        Schema::table('orders', function (Blueprint $table) {
            $table->string('booking_code', 10)->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('booking_code', 10)->nullable()->change();
        });
    }
};
