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
        Schema::create('ujians', function (Blueprint $table) {
            $table->id();

            // PASTIKAN BARIS INI TERTULIS 'kategori_ujian_id' dan 'kategori_ujians'
            $table->foreignId('kategori_ujian_id')->constrained('kategori_ujians')->cascadeOnDelete();

            $table->string('judul_ujian');
            $table->text('deskripsi')->nullable();
            $table->integer('durasi_menit');
            $table->dateTime('waktu_mulai')->nullable();
            $table->dateTime('waktu_selesai')->nullable();
            $table->boolean('acak_soal')->default(true);
            $table->boolean('acak_opsi')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ujians');
    }
};
