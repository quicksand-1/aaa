const regexp = {
  // 数字或字符串数字
  NUMBER: /^(-?\d+(\.\d+)?)$/,
  // 中文
  CHINESE: /^[\u4E00-\u9FA5]+$/,
  // 手机号校验
  PHONE: /^1[3456789]\d{9}$/,
  // 强密码校验
  PASSWORD:
    /^\S*(?=\S{12,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/,
  // 统一社会信用代码
  UNIFIED_CREDIT_CODE:
    /^([0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}|[1-9]\d{14})$/,
  // 身份证校验
  ID_CODE:
    /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
  // 数字和英文
  NUMBER_EN: /^[A-Za-z0-9]+$/,
  EN: /^[A-Za-z]+$/,
};

export default regexp;
