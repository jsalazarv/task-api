import { Subscription, SubscriptionStatus } from '@prisma/client';

export class SubscriptionHelper {
  /**
   * Obtiene la suscripción activa del usuario
   */
  static getActiveSubscription(
    subscriptions: Subscription[],
  ): Subscription | null {
    const now = new Date();

    return (
      subscriptions.find(
        (sub) =>
          sub.status === SubscriptionStatus.ACTIVE &&
          (sub.expiresAt === null || sub.expiresAt > now),
      ) || null
    );
  }

  /**
   * Verifica si la suscripción es premium activa
   */
  static isPremiumActive(subscription: Subscription | null): boolean {
    if (!subscription) return false;

    return (
      subscription.tier === 'PREMIUM' &&
      subscription.status === 'ACTIVE' &&
      (subscription.expiresAt === null || subscription.expiresAt > new Date())
    );
  }

  /**
   * Calcula cuántos días faltan para que expire
   */
  static getDaysUntilExpiration(subscription: Subscription): number | null {
    if (!subscription.expiresAt) return null;

    const now = new Date();
    const diff = subscription.expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
