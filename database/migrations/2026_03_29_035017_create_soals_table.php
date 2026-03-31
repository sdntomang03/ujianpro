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
        Schema::create('soals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_id')->constrained('kategoris')->cascadeOnDelete();
            $table->string('tipe_soal'); // pg, pg_kompleks, isian, menjodohkan, benar_salah, survei
            $table->text('pertanyaan');

            // --- TAMBAHKAN KOLOM GAMBAR DI SINI ---
            $table->string('file_gambar')->nullable(); // nullable karena tidak semua soal punya gambar

            // Kunci Jawaban disimpan di sini (JSON) agar aman dan terpisah dari opsi untuk siswa
            $table->json('kunci_jawaban')->nullable();
            $table->integer('bobot_nilai')->default(10);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soals');
    }
};
