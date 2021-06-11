/* eslint-disable max-classes-per-file */
import { isDefined } from 'ts-is-defined';
import { ParsingError } from './errors';
import { Converter } from './utility_types';

// eslint-disable-next-line no-unused-vars
type Parser<T> = Converter<unknown, T>
// eslint-disable-next-line no-unused-vars
type ConfigParser<T, C> = (config: C) => Parser<T>

type StringParserP = {
  maxLen?: number,
  pattern?: string
  // eslint-disable-next-line no-unused-vars
  custom?: (v: string) => string
}

export const StringParser: ConfigParser<string | undefined, StringParserP> = (c) => (v) => {
  if (typeof v === 'string') {
    let out = v;
    if (c.maxLen !== undefined) out = out.substr(0, c.maxLen);
    if (c.custom !== undefined) out = c.custom(out);
    return out;
  }

  return undefined;
};

type NumberParserP = {
  min?: number
  max?: number
  roundTo?: number
}

export const NumberParser: ConfigParser<number | undefined, NumberParserP> = (params) => (v) => {
  if (typeof v !== 'number') return undefined;
  let out = v;
  if (params.min !== undefined) out = out < params.min ? params.min : out;
  if (params.max !== undefined) out = out > params.max ? params.max : out;
  if (params.roundTo !== undefined && params.roundTo > 0) {
    const pow = 10 ** params.roundTo;
    out = Math.round(out * pow) / pow;
  }
  return out;
};

export const BoolParser: ConfigParser<boolean | undefined, void> = () => (v) => {
  if (typeof v === 'boolean') return v;
  return typeof v === 'string' ? { true: true, false: false }[v] : undefined;
};

type StringArrayParserParams = {
  stringParams?: StringParserP
  strict?: boolean
}

export const StringArrayParser: ConfigParser<string[] | undefined, StringArrayParserParams> = (c) => (v) => {
  return Array.isArray(v)
    ? v.map(StringParser(c.stringParams ?? {})).filter(isDefined)
    : undefined;
};

export function Defined<T>(parser: Converter<any, T | undefined>, placeholder?: T) : Parser<T> {
  return (v: unknown) => {
    const out = parser(v);
    if (out === undefined) {
      if (placeholder === undefined) throw new ParsingError();
      return placeholder;
    }
    return out;
  };
}
