<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksis', function (Blueprint $table) {
            $table->id();
            // Siapa yang beli dan beli paket apa
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('paket_id')->constrained('pakets')->cascadeOnDelete();

            // Detail transaksi
            $table->integer('nominal_transfer');
            $table->string('bukti_pembayaran')->nullable(); // Lokasi file gambar bukti transfer
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('catatan_admin')->nullable(); // Jika ditolak, admin bisa ngasih alasan

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksis');
    }
};
