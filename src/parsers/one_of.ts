import { Comparator } from '../utility_types';
import { Parser } from './parsers';

function OneOf<T>(values: T[], comp?:Comparator<unknown, T>) : Parser<T | undefined> {
  return (v: unknown) => {
    const valueMatches = (val: T) => (comp ? comp(v, val) : v === val);
    return values.some(valueMatches) ? v as T : undefined;
  };
}

export default OneOf;
