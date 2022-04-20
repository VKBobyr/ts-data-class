import { Modifier } from '../utility_types';
import { ConfigModifier, ConfigParser } from './parsers';

type NumberParserP = {
  modifiers?: Modifier<number>[]
}

const NumberParser: ConfigParser<number | undefined, NumberParserP> = (params) => (v) => {
  if (typeof v !== 'number') return undefined;
  return (params.modifiers ?? []).reduce((out, mod) => mod(out), v);
};

export default NumberParser;

const ModNumberMinMax: ConfigModifier<number, { min?: number, max?: number; }> = (c) => {
  return (v) => {
    let out = v;
    if (c.min !== undefined) out = Math.max(out, c.min);
    if (c.max !== undefined) out = Math.min(out, c.max);
    return out;
  };
};

const ModNumberRound: ConfigModifier<number, number> = (decimals) => {
  return (v) => {
    if (decimals < 0) {
      return v;
    }
    const pow = 10 ** decimals;
    return Math.round(v * pow) / pow;
  };
};

export const NumberMods = {
  round: ModNumberRound,
  minMax: ModNumberMinMax,
};
