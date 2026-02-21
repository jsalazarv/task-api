import { UserRole, SubscriptionTier, BillingInterval } from '@prisma/client';

export class SubscriptionDto {
  tier: SubscriptionTier;
  billingInterval: BillingInterval | null;
  expiresAt: Date | null;
  isActive: boolean;
}

export class AuthResponseDto {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  role: UserRole;
  subscription: SubscriptionDto;
  createdAt: Date;
}
