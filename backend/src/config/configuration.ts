export default () => ({
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    forgotPasswordSecret: process.env.JWT_FORGOT_PASSWORD_SECRET,
  },
  nodeEnv: process.env.NODE_ENV || 'development',
});