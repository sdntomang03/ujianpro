import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(data: any): Promise<{
        message: string;
    }>;
    login(nis: string, pass: string): Promise<{
        message: string;
        siswa: {
            sub: number;
            nis: string;
            nama: string;
        };
        access_token: string;
    }>;
}
