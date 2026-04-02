<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Akun Admin / Guru (Bebas Akses)
        User::firstOrCreate(
            ['email' => 'admin@cbtpro.com'],
            [
                'name' => 'Tutor Admin',
                'password' => Hash::make('password'),
                'jenjang' => 'UMUM',
                'paket_id' => 3, // Platinum (Level 30)
            ]
        );

        // 2. Akun Siswa 1 (SMA - Premium)
        User::firstOrCreate(
            ['email' => 'siswa@cbtpro.com'],
            [
                'name' => 'Budi Siswa',
                'password' => Hash::make('password'),
                'jenjang' => 'SMA',
                'paket_id' => 2, // Premium (Level 20)
            ]
        );

        // 3. Akun Siswa 2 (SMP - Reguler) -> Untuk testing pembatasan akses
        User::firstOrCreate(
            ['email' => 'siti@cbtpro.com'],
            [
                'name' => 'Siti Reguler',
                'password' => Hash::make('password'),
                'jenjang' => 'SMP',
                'paket_id' => 1, // Reguler (Level 10)
            ]
        );

        // 4. Akun Siswa 3 (SD - Platinum) -> Untuk testing akses VIP anak SD
        User::firstOrCreate(
            ['email' => 'andi@cbtpro.com'],
            [
                'name' => 'Andi Sultan',
                'password' => Hash::make('password'),
                'jenjang' => 'SD',
                'paket_id' => 3, // Platinum (Level 30)
            ]
        );
    }
}
