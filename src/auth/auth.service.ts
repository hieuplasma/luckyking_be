import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '..//prisma/prisma.service';
import * as argon from 'argon2';
import {
  AuthDTO,
  CheckAuthDTO,
  CreateStaffDTO,
  ForgotPassWordDTO,
  UpdatePassWordDTO,
} from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role, UserStatus } from 'src/common/enum';
import { nDate } from 'src/common/utils';
import { errorMessage } from 'src/common/error_message';

@Injectable({})
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async check(checkAuthDTO: CheckAuthDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        phoneNumber: checkAuthDTO.phoneNumber,
      },
    });
    if (!user) return { registered: false };
    else return { registered: true };
  }

  async register(authDTO: AuthDTO) {
    const hashedPassword = await argon.hash(authDTO.password);
    try {
      const user = await this.prismaService.user.create({
        data: {
          phoneNumber: authDTO.phoneNumber,
          hashedPassword: hashedPassword,
          status: UserStatus.Acticve,
          updateAt: new nDate(),
          Device: {
            create: {
              deviceId: authDTO.deviceId,
              lastLogin: new nDate(),
            },
          },
          role: Role.User,
          MoneyAccount: {
            create: { decription: 'Ví LuckyKing của ' + authDTO.phoneNumber },
          },
          RewardWallet: {
            create: { decription: 'Ví nhận thưởng của ' + authDTO.phoneNumber },
          },
          Cart: { create: {} },
        },
        select: {
          id: true,
          phoneNumber: true,
          createdAt: true,
          updateAt: true,
          Device: true,
          MoneyAccount: true,
          RewardWallet: true,
        },
      });
      const accessToken = await this.signJwtToken(user.id, user.phoneNumber);
      //@ts-ignore
      user.accessToken = accessToken.accessToken;
      return user;
    } catch (error) {
      throw new ForbiddenException(errorMessage.USER_EXISTED);
    }
  }

  async login(authDTO: AuthDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        phoneNumber: authDTO.phoneNumber,
      },
    });
    if (!user) {
      throw new NotFoundException(errorMessage.USER_NOT_FOUND);
    }
    const passwordMatched = await argon.verify(
      user.hashedPassword,
      authDTO.password,
    );
    if (!passwordMatched) {
      throw new UnauthorizedException(errorMessage.WRONG_AUTH);
    }
    delete user.hashedPassword;
    const deviceId = await this.prismaService.device.findFirst({
      where: {
        AND: { userId: user.id, deviceId: authDTO.deviceId },
      },
    });
    if (!deviceId)
      await this.prismaService.device.create({
        data: {
          deviceId: authDTO.deviceId,
          lastLogin: new nDate(),
          user: {
            connect: { id: user.id },
          },
        },
      });

    const { accessToken } = await this.signJwtToken(user.id, user.phoneNumber);

    return {
      accessToken,
      printerUrl: user.printerUrl,
    };
  }

  async superLogin(authDTO: AuthDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        phoneNumber: authDTO.phoneNumber,
      },
    });
    if (!user) {
      throw new NotFoundException(errorMessage.NOT_FOUND);
    }
    const passwordMatched = await argon.verify(
      user.hashedPassword,
      authDTO.password,
    );
    if (!passwordMatched) {
      throw new UnauthorizedException(errorMessage.WRONG_AUTH);
    }
    delete user.hashedPassword;
    const deviceId = await this.prismaService.device.findFirst({
      where: {
        AND: { userId: user.id, deviceId: authDTO.deviceId },
      },
    });
    if (!deviceId)
      await this.prismaService.device.create({
        data: {
          deviceId: authDTO.deviceId,
          lastLogin: new nDate(),
          user: {
            connect: { id: user.id },
          },
        },
      });
    return await this.unExpireJwtToken(user.id, user.phoneNumber);
  }

  async createStaff(createStaffDTO: CreateStaffDTO) {
    const hashedPassword = await argon.hash(createStaffDTO.password);
    try {
      const user = await this.prismaService.user.create({
        data: {
          phoneNumber: createStaffDTO.phoneNumber,
          hashedPassword: hashedPassword,
          status: UserStatus.Acticve,
          updateAt: new nDate(),
          Device: {
            create: {
              deviceId: createStaffDTO.deviceId,
              lastLogin: new nDate(),
            },
          },
          fullName: createStaffDTO.fullName,
          role: createStaffDTO.role,
          address: createStaffDTO.address,
          personNumber: createStaffDTO.personNumber,
          identify: createStaffDTO.identify,
        },
        select: {
          id: true,
          phoneNumber: true,
          createdAt: true,
          Device: true,
          fullName: true,
          role: true,
          address: true,
          personNumber: true,
          identify: true,
        },
      });
      const accessToken = await this.signJwtToken(user.id, user.phoneNumber);
      //@ts-ignore
      user.accessToken = accessToken.accessToken;
      return user;
    } catch (error) {
      throw new ForbiddenException(errorMessage.USER_EXISTED);
    }
  }

  async updatePassword(body: UpdatePassWordDTO) {
    console.log(new Date());
    console.log(new Date().toISOString());
    const hashedPassword = await argon.hash(body.newPassword);
    const user = await this.prismaService.user.findUnique({
      where: {
        phoneNumber: body.phoneNumber,
      },
    });
    if (!user) {
      throw new NotFoundException(errorMessage.NOT_FOUND);
    }
    const passwordMatched = await argon.verify(
      user.hashedPassword,
      body.oldPassword,
    );
    if (!passwordMatched) {
      throw new UnauthorizedException(errorMessage.WRONG_AUTH);
    }

    const update = await this.prismaService.user.update({
      where: { phoneNumber: body.phoneNumber },
      data: { hashedPassword: hashedPassword },
      select: { phoneNumber: true, updateAt: true },
    });
    return update;
  }

  async forgotPassword(body: ForgotPassWordDTO) {
    const hashedPassword = await argon.hash(body.newPassword);
    const user = await this.prismaService.user.findUnique({
      where: {
        phoneNumber: body.phoneNumber,
      },
    });
    if (!user) {
      throw new NotFoundException(errorMessage.USER_NOT_FOUND);
    }
    const update = await this.prismaService.user.update({
      where: { phoneNumber: body.phoneNumber },
      data: { hashedPassword: hashedPassword },
      select: { phoneNumber: true, updateAt: true },
    });
    return update;
  }

  async signJwtToken(
    userId: string,
    phoneNumber: string,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: userId,
      phoneNumber,
    };
    const jwtString = await this.jwtService.signAsync(payload, {
      expiresIn: '2 days',
      secret: this.configService.get('JWT_SECRET'),
    });
    return {
      accessToken: jwtString,
    };
  }

  async unExpireJwtToken(
    userId: string,
    phoneNumber: string,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: userId,
      phoneNumber,
    };
    const jwtString = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
    });
    return {
      accessToken: jwtString,
    };
  }
}
