import { AuthModel, UserModel } from '@quo-pro/database-connect';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { IAuth } from '@quo-pro/commons';
import { JwtService } from '@nestjs/jwt';
import { RegistrationDto } from '../dtos/registration.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) { }

  async login(loginData: LoginDto): Promise<any> {
    const { userName, UUID } = loginData;
    const auth = await AuthModel.findOne({ userName, UUID }).populate('user');

    if (!auth) {
      throw new NotFoundException('USER_NOT_FOUND');
    }
    return this.generateToken(auth);
  }

  async register(registrationData: RegistrationDto): Promise<any> {
    const { UUID, userName } = registrationData;
    const existingAuth = await AuthModel.findOne({ userName });

    if (existingAuth) {
      throw new BadRequestException('USER_ALREADY_EXIST');
    }

    try {
      const newUser = await UserModel.create({ roles: ['USER'], displayName: userName, email: userName, userName });
      const newAuth = await (await AuthModel.create({ user: newUser._id, userName, UUID })).populate("user");

      return this.generateToken(newAuth);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  validateToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new BadRequestException('Invalid token', error.message);
    }
  }

  private generateToken(auth: IAuth): any {
    const payload = {
      _id: auth.user._id,
      roles: auth.user.roles,
      UUID: auth.UUID,
      userName: auth.userName,
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, roles: auth.user.roles, id: auth.user._id };
  }
}
