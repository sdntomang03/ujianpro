import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Menyambungkan ke MySQL bawaan Laragon
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',      // Username default Laragon
      password: '',          // Password default Laragon (kosongkan)
      database: 'cbt',    // Pastikan database ini sudah ada di phpMyAdmin/HeidiSQL
      autoLoadEntities: true,
      synchronize: true,     // AJAIB: NestJS akan otomatis membuatkan tabel di MySQL!
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}