/**
 * Search 表单提交前触发的函数
 * 用例1：用户没有自定义的 beforeSearchSubmit 函数，则直接执行返回 validateRequiredOne 的结果
 * 用例2：用户自定义了 beforeSearchSubmit 函数，且返回对象后直接跳过 validateRequiredOne 的执行
 * */

/**
 * 进行多选1的校验逻辑，会通过 beforeSearchSubmit API 来实现
 * 1、先从 columns 中筛选出符合要求的项
 * 2、判断这些项的值都是 undefined 或 ''
 * 3、返回错误信息供下层逻辑实现提示展示
 * */
const validateRequiredOne = (p, columns) => {
  // 从 columns 中筛选出有 requiredOne 标记，且 required 不为 true
  const requiredOneColumns = columns.filter(
    (i) => !i.required && i.requiredOne,
  );

  if (requiredOneColumns.length > 1) {
    const every = requiredOneColumns.every((i) => {
      return p[i.dataIndex] === undefined || p[i.dataIndex] === '';
    });
    if (every) {
      const titles = requiredOneColumns.map((i) => i.title);
      return { errorMessage: `请至少填写 ${titles.join(' 或 ')} 中的一项` };
    }
  }
  return p;
};

const _beforeSearchSubmit = (p, { columns, beforeSearchSubmit }) => {
  // 首先运行内置的验证函数
  const requiredOne = validateRequiredOne(p, columns);

  /**
   * 如果自定义函数存在，则说明用户可能在开头或结尾进行自定义校验逻辑，那么返回 requiredOne 给用户自己决定何时使用
   * */
  if (beforeSearchSubmit) {
    return beforeSearchSubmit(p, { requiredOne });
  }

  return requiredOne;
};

export default _beforeSearchSubmit;
