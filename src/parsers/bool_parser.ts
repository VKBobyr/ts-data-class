import { ConfigParser } from './parsers';

const BoolParser: ConfigParser<boolean | undefined, void> = () => (v) => {
  if (typeof v === 'boolean') return v;
  return typeof v === 'string' ? { true: true, false: false }[v] : undefined;
};

export default BoolParser;
