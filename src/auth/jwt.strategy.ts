import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Satpam akan mencari tiket di bagian "Authorization Header"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Kunci ini HARUS SAMA PERSIS dengan yang ada di auth.module.ts
      secretOrKey: 'RAHASIA_SUPER_CBT_123', 
    });
  }

  // Jika tiketnya valid, Satpam akan mengekstrak data Budi dari dalam tiket
  async validate(payload: any) {
    return { idSiswa: payload.sub, nis: payload.nis, nama: payload.nama };
  }
}