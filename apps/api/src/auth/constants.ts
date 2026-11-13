if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production environment!');
}

export const JWT_SECRET = process.env.JWT_SECRET ?? 'brewlite-dev-secret-change-me';
export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRATION ?? process.env.JWT_EXPIRES_IN ?? '7d') as any;
