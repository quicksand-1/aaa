import { describe, expect, test } from 'vitest';
import { buildApiTokenTestHeaders } from './SecretTestRequestSupport';

describe('buildApiTokenTestHeaders', () => {
  test('未选择渠道时不改变普通 general-system Bearer 请求', () => {
    expect(buildApiTokenTestHeaders(' test-token ', '')).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer test-token',
    });
  });

  test('MCP 渠道会显式写入 Wiki 所需请求头', () => {
    expect(buildApiTokenTestHeaders('test-token', 'MCP')).toEqual({
      Accept: 'application/json',
      Authorization: 'Bearer test-token',
      'X-Channel-Type': 'MCP',
    });
  });

  test('拒绝不属于 API Token 调用范围的渠道', () => {
    expect(() =>
      buildApiTokenTestHeaders('test-token', 'MINI_PROGRAM'),
    ).toThrow('请求渠道仅支持 WEB 或 MCP');
  });
});
