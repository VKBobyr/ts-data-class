import { Parser } from './parsers';

function ArrayFilteredParser<T>(itemParser: Parser<T>): Parser<NonNullable<T>[] | undefined> {
  return (arr: unknown) => {
    if (!Array.isArray(arr)) return undefined;
    const mapped = arr.map((v: unknown) => itemParser(v));
    return mapped.filter((v) => v !== undefined && v !== null) as NonNullable<T>[];
  };
}

export default ArrayFilteredParser;
