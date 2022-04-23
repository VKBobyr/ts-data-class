import DTClass, {
  DTMembers, DTParams, DTParsers, DTValidators,
} from './data_class';
import BoolParser from './parsers/bool_parser';
import Defined from './parsers/defined';
import DefinedLazy from './parsers/defined_lazy';
import NumberParser, { NumberMods } from './parsers/number_parser';
import StringParser, { StringMods } from './parsers/string_parser';
import OneOf from './parsers/one_of';
import ArrayFilteredParser from './parsers/array_filtered_parser';
import Validators, { Validator } from './validators';

const Parsers = {
  string: StringParser,
  number: NumberParser,
  bool: BoolParser,
  defined: Defined,
  definedLazy: DefinedLazy,
  arrayFiltered: ArrayFilteredParser,
  oneOf: OneOf,
};

const Mods = {
  string: StringMods,
  number: NumberMods,
};

export default DTClass;
export {
  Parsers,
  Mods,
  Validators,

  DTMembers,
  DTParams,
  DTParsers,

  Validator,
  DTValidators,
};
