import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { accessToken: await this.createToken(user) };
  }

  async refresh(user: { id: string; username: string; role: 'admin' | 'staff' }): Promise<{ accessToken: string }> {
    return {
      accessToken: await this.jwtService.signAsync({
        sub: user.id,
        username: user.username,
        role: user.role,
      }),
    };
  }

  private createToken(user: UserDocument): Promise<string> {
    return this.jwtService.signAsync({
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
    });
  }
}
