import { Modifier } from '../utility_types';
import { ConfigModifier, ConfigParser } from './parsers';

type StringParserP = {
  modifiers?: Modifier<string>[]
  // eslint-disable-next-line no-unused-vars
  custom?: (v: string) => string
}

const StringParser: ConfigParser<string | undefined, StringParserP> = (c) => (v) => {
  if (typeof v === 'string') {
    let out = v;
    if (c.modifiers !== undefined) out = c.modifiers.reduce((str, mod) => mod(str), out);
    return out;
  }

  return undefined;
};

export default StringParser;

export const ModStringUpper: ConfigModifier<string, void> = () => (v) => v.toUpperCase();
export const ModStringLower: ConfigModifier<string, void> = () => (v) => v.toLowerCase();
export const ModStringMaxLen: ConfigModifier<string, number> = (maxLen: number) => {
  return (v) => v.substr(0, maxLen);
};
