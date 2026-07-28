import "dotenv/config";

export const env = {
  port: process.env.PORT,
  appUrl: process.env.APP_URL,
  jwt: {
    accessToken: process.env.ACCESS_TOKEN,
    refreshToken: process.env.REFRESH_TOKEN,
    accessExpiresIn: process.env.ACCESS_EXPIRE,
    refreshExpiresIn: process.env.REFRESH_EXPIRE,
  },
  node: process.env.NODE_ENV,
  origins: process.env.ORIGINS?.split(","),
  botkey: process.env.BOT_KEY,
};
