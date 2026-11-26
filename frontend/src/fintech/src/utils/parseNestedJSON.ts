/**
 * 将字符串 JSON 转成 JSON 对象
 */
const parseNestedJSON = (
  text: unknown,
  format?: (value: object) => unknown,
) => {
  // 缺失值、普通对象等非字符串输入无需解析
  if (typeof text !== 'string') {
    return text;
  }

  let t = text;
  let parsed: unknown;

  const replaceList = [
    [`\\`, ''],
    [`"[{"`, `[{"`],
    [`"}]"`, `"}]`],
    [`"{"`, `{"`],
    [`"}"`, `"}`],
    [`"}}"`, `"}}`],
    [`}"`, `}`],
  ];

  replaceList.some(([searchValue, replaceValue]) => {
    t = t.replaceAll(searchValue, replaceValue);

    try {
      parsed = JSON.parse(t);
      return true;
    } catch {
      return false;
    }
  });

  if (parsed !== null && typeof parsed === 'object') {
    return format ? format(parsed) : parsed;
  }

  return text;
};

export default parseNestedJSON;
