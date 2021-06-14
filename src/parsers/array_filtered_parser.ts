import { isDefined } from 'ts-is-defined';
import { Parser } from './parsers';

function ArrayFilteredParser<T>(itemParser: Parser<T>): Parser<NonNullable<T>[] | undefined> {
  return (arr: unknown) => {
    if (!Array.isArray(arr)) return undefined;
    const mapped = arr.map((v: unknown) => itemParser(v));
    return mapped.filter(isDefined);
  };
}

export default ArrayFilteredParser;
