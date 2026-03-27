import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  // Isinya kita kosongkan karena tugas membuat dan mencari siswa 
  // sekarang sudah diurus sepenuhnya oleh AuthController (Register & Login).
}