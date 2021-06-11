import { ParsingError } from '../errors';
import { Parser } from './parsers';

function Defined<T>(parser: Parser<T | undefined>, placeholder?: T) : Parser<T> {
  return (v: unknown, key: string | undefined) => {
    const out = parser(v, key);
    if (out === undefined) {
      if (placeholder === undefined) {
        throw new ParsingError(
          key,
          'expected to be defined, but is undefined',
        );
      }
      return placeholder;
    }
    return out;
  };
}

export default Defined;
