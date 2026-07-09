/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/src/**/*.test.ts', 'packages/*/src/**/*.test.tsx', 'apps/*/src/**/*.test.ts', 'apps/*/src/**/*.test.tsx'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['packages/*/src/**', 'apps/*/src/**'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**', '**/dist/**'],
    },
    reporters: ['default'],
    workspace: [
      {
        test: {
          name: 'shared',
          include: ['packages/shared/src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'database',
          include: ['packages/database/src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'backend',
          include: ['packages/backend/src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'ui',
          include: ['packages/ui/src/**/*.test.tsx', 'packages/ui/src/**/*.test.ts'],
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        test: {
          name: 'api',
          include: ['packages/api/src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'frontend',
          include: ['packages/frontend/src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'orchestrator',
          include: ['packages/orchestrator/src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'dashboard',
          include: ['apps/dashboard/src/**/*.test.tsx', 'apps/dashboard/src/**/*.test.ts'],
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        test: {
          name: 'server',
          include: ['apps/server/src/**/*.test.ts'],
          environment: 'node',
        },
      },
    ],
  },
})
