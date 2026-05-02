// Already using env vars, but ensure host is 'postgres' (service name)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',  // Will be 'postgres' in Docker
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  }
);