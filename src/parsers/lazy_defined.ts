import { Parser } from './parsers';

function DefinedLazy<T>(parser: Parser<T | undefined>, placeholderBuilder: ()=>T) : Parser<T> {
  return (v: unknown, key: string | undefined) => {
    const out = parser(v, key);
    return out ?? placeholderBuilder();
  };
}

export default DefinedLazy;
