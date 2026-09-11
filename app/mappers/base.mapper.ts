export const mapArray = <T, U>(
  items: T[],
  mapper: (item: T) => U,
): U[] => items.map(mapper);

export const mapNullable = <T, U>(
  value: T | null | undefined,
  mapper: (v: T) => U,
): U | null => {
  if (value === null || value === undefined) return null;
  return mapper(value);
};
