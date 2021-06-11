import DClass from './src/data_class';
import Defined from './src/parsers/defined';
import NumberParser from './src/parsers/number_parser';
import StringParser, { ModStringLower, ModStringUpper } from './src/parsers/string_parser';

export default DClass;
export {
  StringParser,
  NumberParser,
  Defined,
  ModStringUpper,
  ModStringLower,
};
