import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {

  // @UseGuards(...) ini adalah si Satpam! 
  // Rute ini tidak bisa ditembus kalau tidak bawa tiket JWT.
  @UseGuards(AuthGuard('jwt')) 
  @Get('ujian')
  masukRuangUjian(@Request() req) {
    // req.user berisi data siswa yang sudah dibaca oleh Satpam dari tiket
    return {
      status: "Berhasil Masuk!",
      pesan: `Selamat mengerjakan ujian, ${req.user.nama}!`,
      soal_1: "Siapa penemu lampu bohlam?",
      data_siswa: req.user
    };
  }
}