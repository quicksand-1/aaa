import 'egg';
import type { Knex } from 'knex';
import type { AuthUser, ModulePermissions } from '../app/lib/types';

declare module 'egg' {
  interface Application {
    knex: Knex;
  }

  interface EggAppConfig {
    database: {
      file: string;
      busyTimeout: number;
    };
    auth: {
      cookieName: string;
      normalHours: number;
      maxFailedAttempts: number;
      lockMinutes: number;
    };
    mobileScan: {
      baseUrl: string;
    };
    wechatMiniapp: {
      appId: string;
      appSecret: string;
    };
    originWhitelist: string[];
  }
}

declare module 'koa' {
  interface DefaultState {
    currentUser?: AuthUser;
    sessionId?: number;
    moduleKey?: string;
  }
}

export type { AuthUser, ModulePermissions };
