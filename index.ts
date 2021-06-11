import DClass from './src/data_class';
import Defined from './src/parsers/defined';
import NumberParser, { ModNumberMinMax, ModNumberRound } from './src/parsers/number_parser';
import StringParser, { ModStringLower, ModStringMaxLen, ModStringUpper } from './src/parsers/string_parser';

export default DClass;
export {
  StringParser,
  NumberParser,
  Defined,
  ModStringUpper,
  ModStringLower,
  ModStringMaxLen,
  ModNumberMinMax,
  ModNumberRound,
};
