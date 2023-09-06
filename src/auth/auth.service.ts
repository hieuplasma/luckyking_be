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
import { RegisterDTO } from './dto/register.dto';

@Injectable({})
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async check(checkAuthDTO: CheckAuthDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        phoneNumber: checkAuthDTO.phoneNumber,
      },
    });
    if (user) {
      console.log('checkUser', user)
      if (user.status !== UserStatus.Acticve) throw new ForbiddenException(errorMessage.BLOCKED_ACCOUNT.replace('phone', checkAuthDTO.phoneNumber));
    }
    if (!user) return { registered: false };
    else return { registered: true };
  }

  async register(authDTO: RegisterDTO) {
    const { phoneNumber, password, identify, fullName, email, deviceId } = authDTO;
    const hashedPassword = await argon.hash(password);

    const checkUser = await this.prismaService.user.findUnique({
      where: { phoneNumber: authDTO.phoneNumber }
    })

    if (checkUser) {
      if (checkUser.status == UserStatus.Acticve) throw new ForbiddenException(errorMessage.USER_EXISTED);
      else throw new ForbiddenException(errorMessage.BLOCKED_ACCOUNT.replace('phone', authDTO.phoneNumber));
    }
    try {
      const user = await this.prismaService.user.create({
        data: {
          phoneNumber: phoneNumber,
          hashedPassword: hashedPassword,
          fullName: fullName,
          email: email,
          identify: identify,
          address: authDTO.address,
          status: UserStatus.Acticve,
          updateAt: new nDate(),
          Device: {
            create: {
              deviceId: deviceId,
              lastLogin: new nDate(),
            },
          },
          currentDeviceId: deviceId,
          role: Role.User,
          MoneyAccount: {
            create: { decription: 'Ví LuckyKing của ' + phoneNumber },
          },
          RewardWallet: {
            create: { decription: 'Ví nhận thưởng của ' + phoneNumber },
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
      const accessToken = await this.signJwtToken(user.id, user.phoneNumber, deviceId);
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
    if (!user) throw new NotFoundException(errorMessage.USER_NOT_FOUND);
    if (user.status !== UserStatus.Acticve) throw new ForbiddenException(errorMessage.BLOCKED_ACCOUNT.replace('phone', authDTO.phoneNumber));
    const passwordMatched = await argon.verify(
      user.hashedPassword,
      authDTO.password,
    );
    if (!passwordMatched) {
      throw new UnauthorizedException(errorMessage.WRONG_AUTH);
    }
    delete user.hashedPassword;


    let device = await this.prismaService.device.findFirst({
      where: {
        deviceId: authDTO.deviceId,
        userId: user.id
      }
    })
    if (!device) {
      device = await this.prismaService.device.create({
        data: {
          deviceId: authDTO.deviceId,
          userId: user.id,
          lastLogin: new nDate(),
        }
      })
    }
    else {
      await this.prismaService.device.update({
        where: { id: device.id },
        data: {
          lastLogin: new nDate()
        }
      })
    }

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { currentDeviceId: authDTO.deviceId }
    })

    const { accessToken } = await this.signJwtToken(user.id, user.phoneNumber, authDTO.deviceId);

    return {
      accessToken,
      printerUrl: user.printerUrl,
      deviceId: device.deviceId
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

  async unverifiedLogin(authDTO: AuthDTO) {
    throw new UnauthorizedException("Hệ thống hiện đang bảo trì")
    const user = await this.prismaService.user.findUnique({
      where: {
        phoneNumber: authDTO.phoneNumber,
      },
    });
    if (!user) throw new NotFoundException(errorMessage.USER_NOT_FOUND);
    if (user.status !== UserStatus.Acticve) throw new ForbiddenException(errorMessage.BLOCKED_ACCOUNT.replace('phone', authDTO.phoneNumber));
    const passwordMatched = await argon.verify(
      user.hashedPassword,
      authDTO.password,
    );
    if (!passwordMatched) {
      throw new UnauthorizedException(errorMessage.WRONG_AUTH);
    }
    delete user.hashedPassword;

    if (user.currentDeviceId !== authDTO.deviceId) {
      return {
        accessToken: false,
        message: "Bạn cần mã OTP để đăng nhập ở thiết bị này"
      }
    }

    let device = await this.prismaService.device.findFirst({
      where: {
        deviceId: authDTO.deviceId,
        userId: user.id
      }
    })
    await this.prismaService.device.update({
      where: { id: device.id },
      data: {
        lastLogin: new nDate()
      }
    })

    const { accessToken } = await this.signJwtToken(user.id, user.phoneNumber, authDTO.deviceId);

    return {
      accessToken,
      printerUrl: user.printerUrl,
      deviceId: device.deviceId
    };
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
      const accessToken = await this.signJwtToken(user.id, user.phoneNumber, createStaffDTO.deviceId);
      //@ts-ignore
      user.accessToken = accessToken.accessToken;
      return user;
    } catch (error) {
      throw new ForbiddenException(errorMessage.USER_EXISTED);
    }
  }

  async updatePassword(body: UpdatePassWordDTO) {
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

  async deleteAccount(body: AuthDTO) {
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
      body.password,
    );
    if (!passwordMatched) {
      throw new ForbiddenException(errorMessage.WRONG_PASS)
    }

    const update = await this.prismaService.user.update({
      where: { phoneNumber: body.phoneNumber },
      data: { status: UserStatus.Block },
      select: { phoneNumber: true, updateAt: true, status: true },
    });
    return update;
  }

  async signJwtToken(
    userId: string,
    phoneNumber: string,
    deviceId: string
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: userId,
      phoneNumber,
      deviceId
    };
    const jwtString = await this.jwtService.signAsync(payload, {
      expiresIn: '7 days',
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

  async getPriorityNumber() {
    const list = await this.prismaService.priorityNumber.findMany({})
    let res: string[] = []
    for (const element of list) res.push(element.phoneNumber)
    return res
  }
}
