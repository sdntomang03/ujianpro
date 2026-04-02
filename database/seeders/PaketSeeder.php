<?php

namespace Database\Seeders;

use App\Models\Paket;
use Illuminate\Database\Seeder;

class PaketSeeder extends Seeder
{
    public function run(): void
    {
        Paket::create([
            'id' => 1,
            'nama_paket' => 'Reguler',
            'level' => 10,
            'warna_tema' => 'slate',
        ]);

        Paket::create([
            'id' => 2,
            'nama_paket' => 'Premium',
            'level' => 20,
            'warna_tema' => 'amber',
        ]);

        Paket::create([
            'id' => 3,
            'nama_paket' => 'Platinum',
            'level' => 30,
            'warna_tema' => 'sky',
        ]);
    }
}
