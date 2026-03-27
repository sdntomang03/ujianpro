import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth') // Alamat dasarnya adalah /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Rute: POST /auth/register
  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  // Rute: POST /auth/login
  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.nis, body.password);
  }
}