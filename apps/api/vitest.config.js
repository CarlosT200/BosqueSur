import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Entorno de prueba: base de datos separada y rate limit relajado.
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://bosquesur:bosquesur_dev@127.0.0.1:5432/bosquesur_es3_test?schema=public',
      JWT_SECRET: 'test_secret_bosquesur_es3_1234567890',
      JWT_EXPIRES_IN: '1h',
      CORS_ORIGINS: 'http://localhost:5173',
    },
    include: ['tests/**/*.test.js'],
    fileParallelism: false,
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    sequence: { concurrent: false },
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});
