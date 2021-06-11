import DClass from './src/data_class';
import BoolParser from './src/parsers/bool_parser';
import Defined from './src/parsers/defined';
import NumberParser, { NumberMods } from './src/parsers/number_parser';
import StringParser, { StringMods } from './src/parsers/string_parser';

export default DClass;
export {
  StringParser,
  NumberParser,
  Defined,
  StringMods,
  NumberMods,
  BoolParser,
};
