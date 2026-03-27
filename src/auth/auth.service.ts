import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // Tambahkan JwtService di dalam constructor
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService, 
  ) {}

  async register(data: any) {
    const existingUser = await this.usersService.findByNis(data.nis);
    if (existingUser) {
      return { message: 'Gagal! NIS ini sudah terdaftar.' };
    }
    await this.usersService.createSiswa(data);
    return { message: 'Register Berhasil! Silakan coba Login.' };
  }

  async login(nis: string, pass: string) {
    const user = await this.usersService.findByNis(nis);
    if (!user) {
      throw new UnauthorizedException('NIS tidak ditemukan!');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Password salah!');
    }

    // --- BAGIAN YANG BARU ---
    // Membungkus identitas Budi ke dalam tiket
    const payload = { sub: user.id, nis: user.nis, nama: user.nama };
    
    // Mencetak tiket JWT
    return {
      message: 'Login Sukses!',
      siswa: payload,
      access_token: await this.jwtService.signAsync(payload), // Ini adalah gelang tiketnya!
    };
  }
}