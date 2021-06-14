import DTClass from '../data_class';
import { Constructor } from '../utility_types';
import { Parser } from './parsers';

function ParseOrEmpty<T extends DTClass<T>>(t: Constructor<T>) : Parser<T> {
  return (v: unknown) => {
    // @ts-ignore
    const out = t.tryParse(v);
    // @ts-ignore
    return out ?? t.empty();
  };
}

export default ParseOrEmpty;
