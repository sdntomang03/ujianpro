import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// @Entity('siswa') menyuruh NestJS membuatkan tabel bernama 'siswa' di MySQL
@Entity('siswa') 
export class User {
  @PrimaryGeneratedColumn()
  id: number; // ID otomatis (1, 2, 3...)

  @Column({ unique: true })
  nis: string; // NIS tidak boleh ada yang kembar

  @Column()
  nama: string;

  @Column()
  password: string; 
}