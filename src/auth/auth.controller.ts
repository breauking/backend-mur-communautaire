import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Login } from './dto/login.dto';

@Controller('auth')
export class AuthController {
constructor(private readonly authService: AuthService) {}

@Post('signup')
signUp(@Body() signupDto: SignUpDto) {
return this.authService.signUp(signupDto);
}

@Post('login')
signin(@Body() loginDto: Login) {
return this.authService.login(loginDto);
}
}