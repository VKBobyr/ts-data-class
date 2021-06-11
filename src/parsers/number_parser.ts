import { ConfigParser } from './parsers';

type NumberParserP = {
  min?: number
  max?: number
  roundTo?: number
}

const NumberParser: ConfigParser<number | undefined, NumberParserP> = (params) => (v) => {
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

export default NumberParser;
