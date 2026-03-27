import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Fitur untuk mendaftarkan siswa baru (Register)
  async createSiswa(data: any): Promise<any> {
    // Mengacak password sebelum disimpan ke database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = this.usersRepository.create({
      nis: data.nis,
      nama: data.nama,
      password: hashedPassword,
    });

    return this.usersRepository.save(newUser);
  }

  // Fitur untuk mencari siswa berdasarkan NIS (Untuk Login)
async findByNis(nis: string): Promise<User | null> { // <-- Pastikan ini tertulis null, bukan undefined
    return this.usersRepository.findOne({ where: { nis } });
  }
}