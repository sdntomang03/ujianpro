<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Kita bisa membuat beberapa akun sekaligus untuk simulasi
        User::firstOrCreate(
            ['email' => 'siswa@cbtpro.com'],
            ['name' => 'Budi Siswa', 'password' => Hash::make('password')]
        );

        User::firstOrCreate(
            ['email' => 'admin@cbtpro.com'],
            ['name' => 'Tutor Admin', 'password' => Hash::make('password')]
        );
    }
}
