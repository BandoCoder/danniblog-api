module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://bjewell@localhost/danni_blog",
  JWT_SECRET: process.env.JWT_SECRET || "beware-oblivion-is-at-hand",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "30m",
};
