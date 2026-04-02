<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. BUAT ROLE (Abaikan jika sudah ada)
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $siswaRole = Role::firstOrCreate(['name' => 'siswa']);

        // 2. ASSIGN ROLE KE USER DARI USERSEEDER
        // Kita cari user berdasarkan email yang kamu buat di UserSeeder

        // Contoh untuk Admin
        $admin = User::where('email', 'admin@cbtpro.com')->first();
        if ($admin) {
            $admin->assignRole($adminRole);
        }

        // Contoh untuk Siswa (Bisa pakai loop jika siswanya banyak)
        $siswa = User::where('email', 'siswa@cbtpro.com')->first();
        if ($siswa) {
            $siswa->assignRole($siswaRole);
        }

        // JIKA KAMU INGIN SEMUA USER YANG BUKAN ADMIN JADI SISWA:

        User::where('email', '!=', 'admin@cbtpro.com')->get()->each(function ($user) use ($siswaRole) {
            $user->assignRole($siswaRole);
        });

        $this->command->info('Roles have been assigned to existing users!');
    }
}
