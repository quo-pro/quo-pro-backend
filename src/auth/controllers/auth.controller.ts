import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegistrationDto } from '../dtos/registration.dto';
import { LoginDto } from '../dtos/login.dto';
import { ValidateTokenDto } from '../dtos/validate-token.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiBody({
    type: LoginDto,
    description: 'Sign-in payload',
  })
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Post('register')
  @ApiBody({
    type: RegistrationDto,
    description: 'Sign-up payload',
  })
  register(@Body() payload: RegistrationDto) {
    return this.authService.register(payload);
  }

  @Post('validate')
  @ApiBody({
    type: ValidateTokenDto,
    description: 'Payload structure for token',
  })
  validateToken(@Body() payload: ValidateTokenDto) {
    return this.authService.validateToken(payload.token);
  }
}
