import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark endpoints as public (bypass authentication)
 * Follows SOLID principles: Single Responsibility
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

