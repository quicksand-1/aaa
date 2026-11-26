// 新业务模块需要同时在前端与 backend/app/lib/permissions.ts 中登记。
export const PERMISSION_MODULES = [];

export const REGEXP = {
  // 金额字段名，如 xxxAmt、xxxBal、xxxAmount
  AMOUNT: /(Amt|Bal|Amount)$/,
  // 用户名：3-30 位字母、数字、下划线
  USERNAME: /^[A-Za-z0-9_]{3,30}$/,
  // 密码：12-18 位，且必须包含大小写字母、数字和特殊字符
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*? ])\S{12,18}$/,
};
