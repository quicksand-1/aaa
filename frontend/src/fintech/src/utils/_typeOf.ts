const _typeOf = <T>(obj: T, type: string): boolean =>
  Object.prototype.toString.call(obj) === `[object ${type}]`;

export default _typeOf;
