import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    // Konfigurasi Mesin Pembuat Tiket (JWT)
    JwtModule.register({
      secret: 'RAHASIA_SUPER_CBT_123', // Kunci rahasia untuk stempel tiket (nanti bisa dipindah ke file .env)
      signOptions: { expiresIn: '2h' }, // Tiket ujian berlaku selama 2 jam!
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy],
})
export class AuthModule {}