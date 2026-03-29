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
        Schema::create('peserta_ujians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ujian_id')->constrained('ujians')->cascadeOnDelete();

            // MASTERPIECE: Menyimpan urutan soal & opsi acak 1 baris saja!
            $table->json('peta_acakan');

            $table->dateTime('waktu_mulai');
            $table->dateTime('batas_waktu');
            $table->dateTime('waktu_selesai')->nullable();
            $table->enum('status', ['mengerjakan', 'selesai'])->default('mengerjakan');
            $table->decimal('nilai_akhir', 5, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peserta_ujians');
    }
};
