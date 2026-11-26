import { hash, verify } from '@node-rs/argon2';

export const PASSWORD_MESSAGE =
  '密码必须包含大小写字母、数字、特殊字符(!@#$%^&*?)，长度12-18位';

// 在 frontend/src/fintech/src/utils/regexp.ts 的 PASSWORD 基础上收紧长度上限到 18 位
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*? ])\S{12,18}$/;

let dummyHash: string | undefined;

export function isPasswordValid(password: unknown): boolean {
  return typeof password === 'string' && PASSWORD_PATTERN.test(password);
}

export function hashPassword(password: string): Promise<string> {
  return hash(password);
}

export function verifyPassword(
  hashed: string,
  password: string,
): Promise<boolean> {
  return verify(hashed, password);
}

/**
 * 账号不存在时也执行一次哈希校验，降低通过响应时间判断账号是否存在的可能。
 */
export async function verifyDummyPassword(password: string): Promise<void> {
  if (!dummyHash) {
    dummyHash = await hash('dummy-password-for-timing-only');
  }
  try {
    await verify(dummyHash, password);
  } catch {
    // 忽略校验失败，只关心耗时
  }
}
