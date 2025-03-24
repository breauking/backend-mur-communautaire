import { Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcryptjs';
import { Login } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
constructor(
// Injecte le modèle User pour interagir avec la base de données MongoDB
@InjectModel(User.name) private userModel: Model<User>,
private jwtService: JwtService,
private configService: ConfigService,
) {}

async signUp(signupDto: SignUpDto) {
    const { username, email, password } = signupDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    // Création d'un nouvel utilisateur dans la base de données
    const user = await this.userModel.create({
        username,
        email,
        password: hashedPassword,
    });

    // Sauvegarde explicite de l'utilisateur en base
    await user.save();

    const token = await this.jwtService.sign(
        { id: user.id },
        {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRES'),
        },
    );
    return { token };
}

async login(loginDto: Login) {
    const { email, password } = loginDto;
    // Recherche de l'utilisateur en base de données via son email
    const user = await this.userModel.findOne({
        email,
    });

    if (!user) throw new UnauthorizedException('invalid email or password');
    const passwordMatch = await bcrypt.compare(password,user.password);
    if (!passwordMatch) throw new UnauthorizedException('invalid email or password');

    // Génération d'un token JWT pour l'utilisateur authentifié
    const token = await this.jwtService.sign(
        { id: user.id }, // Payload du token 
        {
        secret: this.configService.get('JWT_SECRET'),
        }
    );
    return { token }; // token JWT
}
}