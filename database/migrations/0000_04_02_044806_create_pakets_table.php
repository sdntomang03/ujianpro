<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pakets', function (Blueprint $table) {
            $table->id();
            $table->string('nama_paket'); // Contoh: Reguler, Premium, Platinum
            $table->integer('level'); // Contoh: 10, 20, 30
            $table->string('warna_tema')->default('indigo'); // Untuk styling UI di React
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pakets');
    }
};
