import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { OTP_SECRECT } from './otp.service';

@Injectable()
export class OtpMiddleware implements NestMiddleware {

  constructor(private jwtService: JwtService) { }
  use(req: Request, res: Response, next: () => void) {
    const token = req.headers.authorization;
    if (token != null && token != '') {
      this.jwtService.verifyAsync(token.replace('Bearer ', ''), { secret: OTP_SECRECT })
        .then(async (decodedToken) => {
          // req['user'] = {
          //   phoneNumber: decodedToken.phoneNumber,
          // };
          next();
        })
        .catch(() => {
          OtpMiddleware.accessDenied(req.url, res);
        });
    } else {
      OtpMiddleware.accessDenied(req.url, res);
    }
  }

  private static accessDenied(url: string, res: Response) {
    res.status(403).json({
      statusCode: 403,
      timestamp: new Date().toISOString(),
      path: url,
      message: 'Phiên xác thực không hợp lệ',
    });
  }
}
