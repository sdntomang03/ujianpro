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
        Schema::create('soal_opsis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('soal_id')->constrained('soals')->cascadeOnDelete();
            $table->text('teks_opsi'); // Isi jawaban: "Jakarta", "Merah Putih", dll
            $table->string('group')->nullable(); // Untuk Menjodohkan: 'kiri' atau 'kanan'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soal_opsis');
    }
};
