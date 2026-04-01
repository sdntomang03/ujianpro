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

            // Relasi ke tabel kategori (Pastikan tabel 'kategoris' sudah dibuat sebelumnya)
            $table->foreignId('kategori_id')->constrained('kategoris')->cascadeOnDelete();

            $table->string('tipe_soal'); // pg, pg_kompleks, isian, menjodohkan, benar_salah, survei

            // Teks pertanyaan dibuat nullable karena tipe Benar/Salah (opsional) mungkin tidak butuh teks parent
            $table->text('pertanyaan')->nullable();

            // Lampiran gambar utama soal
            $table->string('file_gambar')->nullable();

            // Kunci Jawaban JSON HANYA dipakai untuk soal Menjodohkan (menyimpan peta ID Kiri ke ID Kanan)
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
