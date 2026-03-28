import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    createSiswa(data: any): Promise<any>;
    findByNis(nis: string): Promise<User | null>;
}
