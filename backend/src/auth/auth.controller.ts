import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { credential?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!body?.credential) {
      throw new UnauthorizedException('Carnet requerido');
    }

    const result = await this.authService.login(body.credential);
    res.setHeader('Set-Cookie', result.cookie);
    return result.user;
  }

  @Get('me')
  async me(@Req() req: Request) {
    return this.authService.me(req.headers.cookie);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const result = this.authService.logout();
    res.setHeader('Set-Cookie', result.cookie);
    return result;
  }
}