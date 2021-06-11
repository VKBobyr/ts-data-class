import { Modifier } from '../utility_types';
import { ConfigParser } from './parsers';

type StringParserP = {
  maxLen?: number,
  pattern?: string
  modifiers?: Modifier<string>[]
  // eslint-disable-next-line no-unused-vars
  custom?: (v: string) => string
}

const StringParser: ConfigParser<string | undefined, StringParserP> = (c) => (v) => {
  if (typeof v === 'string') {
    let out = v;
    if (c.maxLen !== undefined) out = out.substr(0, c.maxLen);
    if (c.custom !== undefined) out = c.custom(out);
    if (c.modifiers !== undefined) out = c.modifiers.reduce((str, mod) => mod(str), out);
    return out;
  }

  return undefined;
};

export default StringParser;

export const ModStringUpper: Modifier<string> = (v) => v.toUpperCase();
export const ModStringLower: Modifier<string> = (v) => v.toLowerCase();
