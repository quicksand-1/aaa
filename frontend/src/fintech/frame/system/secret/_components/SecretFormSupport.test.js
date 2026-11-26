import { describe, expect, test } from 'vitest';
import {
  buildCreateSecretPayload,
  buildEditSecretInitialValues,
  buildEditSecretPayload,
  CREATE_SECRET_FORM_ITEMS,
  normalizeScopes,
} from './SecretFormSupport';

describe('SecretFormSupport', () => {
  test('创建页包含名称、有效期和 ScopeSelector', () => {
    expect(CREATE_SECRET_FORM_ITEMS).toHaveLength(3);
    expect(CREATE_SECRET_FORM_ITEMS[0]).toMatchObject({
      name: 'tokenName',
      rules: [expect.objectContaining({ required: true, whitespace: true })],
    });
  });

  test('创建请求提交可选有效期和 scopeCode', () => {
    expect(
      buildCreateSecretPayload({
        expiresAt: '2099-01-01 00:00:00',
        scopes: ['get-/system/user/page.json', 'get-/system/user/page.json'],
        tokenName: '  MCP 调用  ',
      }),
    ).toEqual({
      expiresAt: '2099-01-01 00:00:00',
      scopes: ['get-/system/user/page.json'],
      tokenName: 'MCP 调用',
    });
  });

  test('编辑请求规范化 scope 并允许通过空数组清除范围', () => {
    expect(
      buildEditSecretPayload(
        { id: '1001' },
        {
          scopes: [
            'get-/materials/children',
            'get-/materials/children',
            'post-/business-documents/files',
          ],
          tokenName: '  受限调用  ',
        },
      ),
    ).toEqual({
      expiresAt: null,
      scopes: ['get-/materials/children', 'post-/business-documents/files'],
      tokenId: '1001',
      tokenName: '受限调用',
    });

    expect(
      buildEditSecretPayload(
        { id: '1001' },
        { scopes: [], tokenName: '不限接口' },
      ),
    ).toEqual({
      expiresAt: null,
      scopes: [],
      tokenId: '1001',
      tokenName: '不限接口',
    });
  });

  test('编辑表单回填不包含 accessToken', () => {
    const values = buildEditSecretInitialValues({
      accessToken: 'sensitive-placeholder',
      expiresAt: null,
      scopes: ['get-/materials/children'],
      tokenName: 'MCP 调用',
    });

    expect(values).toEqual({
      expiresAt: null,
      scopes: ['get-/materials/children'],
      tokenName: 'MCP 调用',
    });
    expect(values).not.toHaveProperty('accessToken');
  });

  test('scopeCode 只做去空去重，不自行解析 URL', () => {
    expect(
      normalizeScopes([' get-/raws/history ', 'get-/raws/history']),
    ).toEqual(['get-/raws/history']);
  });
});
