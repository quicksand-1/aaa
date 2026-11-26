/**
 * 数据过滤
 * 1、按照内部的 open 字段进行过滤，默认为 true
 * */

function _filter<T extends Record<string, any>>(d: T[] = []) {
  return d.filter((item) => {
    // 判断 i 是否为对象
    if (typeof item === 'object' && item !== null) {
      const { open = true, ...i } = item;
      return typeof open === 'function' ? open(i) : open;
    }

    return false;
  });
}

export default _filter;
