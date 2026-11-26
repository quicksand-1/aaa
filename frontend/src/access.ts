/**
 * 项目权限数据管理
 * @url: https://umijs.org/docs/max/access
 * 1、return 出去的字段，需要搭配 /config/routes.ts 中进行使用
 * 2、initialState 是全局的状态管理数据，需要从中获取我们需要的权限码
 * */

/**
 * 权限码输入类型
 * {
 *    role: true,
 *    dept: true,
 *    ... // 其他权限
 * }
 * */
type AccessCodes = {
  [key in string]: boolean;
};

interface CurrentUser {
  authFunctionList: string[];
}

export default (initialState: { currentUser?: CurrentUser }) => {
  const { currentUser } = initialState || {};

  const accessCodes: AccessCodes = {};

  // authFunctionList 是全量权限码，在此进行序列化成可用的格式
  currentUser?.authFunctionList?.forEach((code) => {
    accessCodes[code] = true;
  });

  return accessCodes;
};
