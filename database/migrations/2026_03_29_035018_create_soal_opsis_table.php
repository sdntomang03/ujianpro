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

            $table->text('teks_opsi');

            // Digunakan khusus untuk Menjodohkan (menyimpan nilai "L1", "R1", dll)
            $table->string('group')->nullable();

            // --- TAMBAHAN BARU: Status Kebenaran Opsi ---
            $table->boolean('is_correct')->default(false);

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
