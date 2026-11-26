import dayjs from 'dayjs';
import { createElement } from 'react';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const TOKEN_NAME_ITEM = {
  label: '秘钥名称',
  name: 'tokenName',
  rules: [
    {
      max: 100,
      message: '秘钥名称最多 100 个字符',
      required: true,
      whitespace: true,
    },
  ],
};

function scopeItem(scopeComponent, scopeProps) {
  return {
    children: scopeComponent ? createElement(scopeComponent, scopeProps) : null,
    label: '接口授权范围（可选）',
    name: 'scopes',
    required: false,
    tooltip:
      '留空表示 Token 自身不额外限制，但仍受系统全局 API Token 接口清单及用户权限约束',
  };
}

export function buildCreateSecretFormItems(scopeComponent, scopeProps) {
  return [
    TOKEN_NAME_ITEM,
    {
      format: DATE_TIME_FORMAT,
      inputProps: {
        disabledDate: (current) => current?.endOf('day').isBefore(dayjs()),
        placeholder: '留空表示不限期限',
        showTime: true,
      },
      label: '过期时间（可选）',
      name: 'expiresAt',
      required: false,
      tooltip: '留空表示不限期限',
      valueType: 'datePicker',
    },
    scopeItem(scopeComponent, scopeProps),
  ];
}

export function buildEditSecretFormItems(scopeComponent, scopeProps) {
  return [
    TOKEN_NAME_ITEM,
    {
      format: DATE_TIME_FORMAT,
      inputProps: {
        disabledDate: (current) => current?.endOf('day').isBefore(dayjs()),
        placeholder: '留空表示不限期限',
        showTime: true,
      },
      label: '过期时间（可选）',
      name: 'expiresAt',
      required: false,
      tooltip: '留空表示不限期限',
      valueType: 'datePicker',
    },
    scopeItem(scopeComponent, scopeProps),
  ];
}

/** 仅传递 ScopeSelector 返回的后端 scopeCode，不自行拼接或解析 URL。 */
export function normalizeScopes(value) {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.map((scope) => String(scope || '').trim()).filter(Boolean),
        ),
      ]
    : [];
}

/** 把 DatePicker 值格式化为 general-system 接受的日期时间字符串。 */
export function formatExpiresAt(value) {
  if (!value) return undefined;
  return typeof value.format === 'function'
    ? value.format(DATE_TIME_FORMAT)
    : String(value);
}

/** 构造创建请求；可选字段为空时省略，scope 值来自后端候选项。 */
export function buildCreateSecretPayload(values) {
  const payload = {
    tokenName: String(values?.tokenName || '').trim(),
  };
  const expiresAt = formatExpiresAt(values?.expiresAt);
  if (expiresAt) payload.expiresAt = expiresAt;
  if (Array.isArray(values?.scopes))
    payload.scopes = normalizeScopes(values.scopes);
  return payload;
}

/** 构造编辑请求；空 scope 数组用于显式清除已有的接口范围。 */
export function buildEditSecretPayload(record, values) {
  const payload = {
    expiresAt: formatExpiresAt(values?.expiresAt) || null,
    scopes: normalizeScopes(values?.scopes),
    tokenId: record.id,
    tokenName: String(values?.tokenName || '').trim(),
  };
  return payload;
}

/** 把列表记录转换为编辑表单值，不把 Token 明文放入表单状态。 */
export function buildEditSecretInitialValues(record) {
  return {
    expiresAt: record?.expiresAt ? dayjs(record.expiresAt) : null,
    scopes: Array.isArray(record?.scopes) ? record.scopes : [],
    tokenName: record?.tokenName || '',
  };
}

export const CREATE_SECRET_FORM_ITEMS = buildCreateSecretFormItems();
export const EDIT_SECRET_FORM_ITEMS = buildEditSecretFormItems();
export { TOKEN_NAME_ITEM };
