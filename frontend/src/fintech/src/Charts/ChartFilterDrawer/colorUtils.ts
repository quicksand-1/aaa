// 自定义 memoize 函数，避免依赖 lodash
const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

const CATEGORY10 = [
  '#1783FF',
  '#00C9C9',
  '#F0884D',
  '#D580FF',
  '#7863FF',
  '#60C42D',
  '#BD8F24',
  '#FF80CA',
  '#2491B3',
  '#17C76F',
] as const;

const CATEGORY20 = [
  '#1783FF',
  '#00C9C9',
  '#F0884D',
  '#D580FF',
  '#7863FF',
  '#60C42D',
  '#BD8F24',
  '#FF80CA',
  '#2491B3',
  '#17C76F',
  '#AABA01',
  '#BC7CFC',
  '#237CBC',
  '#2DE379',
  '#CE8032',
  '#FF7AF4',
  '#545FD3',
  '#AFE410',
  '#D8C608',
  '#FFA1E0',
] as const;

const getColorPalette = (categoryCount: number): readonly string[] => {
  return categoryCount <= 10 ? CATEGORY10 : CATEGORY20;
};

const getCategoryIndex = memoize(
  (category: string, categories: string[]): number => {
    return categories.indexOf(category);
  },
);

export const getCategoryColor = (
  category: string,
  categories: string[],
): string => {
  const palette = getColorPalette(categories.length);
  const index = getCategoryIndex(category, categories);
  const colorIndex = index % palette.length;
  return palette[colorIndex];
};

export const getCategoryColorByIndex = (
  index: number,
  categoryCount: number,
): string => {
  const palette = getColorPalette(categoryCount);
  const colorIndex = index % palette.length;
  return palette[colorIndex];
};
