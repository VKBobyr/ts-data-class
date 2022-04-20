/* eslint-disable max-classes-per-file */
import DTClass, {
  DTMembers, DTParsers, Mods, Parsers, Validators,
} from '../src';
import { DTParams, DTValidation, DTValidators } from '../src/data_class';

const parsers: DTParsers<Person> = {
  state: Parsers.string({ modifiers: [Mods.string.upper(), Mods.string.maxLen(2)] }),
  firstName: Parsers.defined(Parsers.string({})),
  lastName: Parsers.definedLazy(Parsers.string({}), () => 'unknown'),
  middleName: Parsers.string({}),
  employer: Parsers.defined(Parsers.string({}), 'unknown'),
  inventory: (v) => (Array.isArray(v) ? v : undefined),
  age: Parsers.number({}),
};

const validators: DTValidators<Person> = {
  state: Validators.defined(),
  firstName: Validators.strings.maxLen(3),
  lastName: Validators.strings.maxLen(3),
  middleName: null,
  inventory: (v) => {
    if (!v) return undefined;
    return (v.length > 0 ? undefined : 'Must have at least one item');
  },
  age: Validators.defined([Validators.numbers.max(3), Validators.numbers.min(0)]),
  employer: Validators.defined(),
};

export class Person extends DTClass<Person> {
  firstName!: string
  middleName?: string
  lastName!: string
  employer?: string
  age?: number
  state?: string
  inventory?: string[]

  constructor(params: DTMembers<Person>) {
    super({ parsers, validators });
    this.assign(params);
  }
}

export const getCorrectValidParams = (): DTParams<Person> => ({
  age: 2,
  firstName: 'fn',
  lastName: 'ln',
  middleName: 'mn',
  state: 'Florida',
  inventory: ['item 1'],
});

export const getInvalidParams = (): DTParams<Person> => ({
  age: 5, // max 3
  firstName: 'abcd', // max 3
  lastName: 'abcd', // max 3
  middleName: 'AAAAAAAAAA', // not validated
  // state undefined
  inventory: [], // must have at least one item
  employer: 'employer', // should pass
});

export const errRequired = 'Required';
export const errNumMax = 'Must be at most 3.';
export const errStrMax = 'Must be at most 3 characters long.';

export const invalidParamValidation: DTValidation<Person> = ({
  age: errNumMax,
  firstName: errStrMax,
  lastName: errStrMax,
  inventory: 'Must have at least one item',
  state: errRequired,
});

export const getParsedParams = () => ({
  age: 2,
  employer: 'unknown',
  firstName: 'fn',
  lastName: 'ln',
  middleName: 'mn',
  state: 'FL',
  inventory: ['item 1'],
});

/** firstName missing */
export const getIncorrectParams = () => ({
  age: 2,
  employer: 'e',
  lastName: 'ln',
  middleName: 'mn',
  state: 'Florida',
  inventory: ['item 1'],
});

export const getCorrectValidation = () => undefined;
// ---------------------------------------------------------------------------------------------

const smolParsers: DTParsers<EmptyablePerson> = {
  name: Parsers.defined(Parsers.string({}), 'default name'),
  age: Parsers.number({}),
};

export class EmptyablePerson extends DTClass<EmptyablePerson> {
    name!: string
    age?: number | undefined

    constructor(params: DTMembers<EmptyablePerson>) {
      super({ parsers: smolParsers });
      this.assign(params);
    }
}
