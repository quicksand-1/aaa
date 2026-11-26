import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.test.{ts,js,jsx,tsx}',
      'src/**/*.spec.{ts,js,jsx,tsx}',
      'frame/**/*.test.{ts,js,jsx,tsx}',
      'frame/**/*.spec.{ts,js,jsx,tsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
