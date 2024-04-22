import { UserModel } from '@quo-pro/database-connect';
import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/auth/services/auth.service';
import { IToken } from '@quo-pro/commons';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.headers['access-token'];
    let token: IToken;
    if (!accessToken) throw new BadRequestException('ACCESS_TOKEN_REQUIRED');

    try {
      token = await this.authService.validateToken(accessToken.toString());
    } catch (err) {
      console.error('Auth middleware called for ', req.path, err);
      throw new BadRequestException('INVALID_TOKEN');
    }

    const user = await UserModel.findOne({ _id: token._id })
    req.user = user;

    next();
  }
}
