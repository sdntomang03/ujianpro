import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: any): Promise<{
        message: string;
    }>;
    login(body: any): Promise<{
        message: string;
        siswa: {
            sub: number;
            nis: string;
            nama: string;
        };
        access_token: string;
    }>;
}
