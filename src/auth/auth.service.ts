import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User, Subscription } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SubscriptionHelper } from './helpers/subscription.helper';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // 1. Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // 2. Hashear la contraseña
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    try {
      // 3. Crear usuario y suscripción FREE en una transacción
      const result = await this.prisma.$transaction(async (tx) => {
        // Crear usuario
        const user = await tx.user.create({
          data: {
            email: registerDto.email,
            name: registerDto.name,
            passwordHash,
            role: 'USER',
            emailVerified: false,
            isActive: true,
          },
        });

        // Crear suscripción FREE automáticamente
        const subscription = await tx.subscription.create({
          data: {
            userId: user.id,
            tier: 'FREE',
            billingInterval: null,
            status: 'ACTIVE',
            startedAt: new Date(),
            expiresAt: null,
          },
        });

        return { user, subscription };
      });

      // 4. Formatear respuesta
      return this.formatAuthResponse(result.user, result.subscription);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Formatea la respuesta de autenticación
   */
  private formatAuthResponse(
    user: User,
    subscription: Subscription,
  ): AuthResponseDto {
    const isActive = SubscriptionHelper.isPremiumActive(subscription);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      role: user.role,
      subscription: {
        tier: subscription.tier,
        billingInterval: subscription.billingInterval,
        expiresAt: subscription.expiresAt,
        isActive,
      },
      createdAt: user.createdAt,
    };
  }
}
