import DTClass, {
  DTMembers,
  DTParsers,
  DTValidators,
  Mods,
  Parsers,
  Validators,
} from '../src';

const parsers: DTParsers<Person> = {
  state: Parsers.string({ modifiers: [Mods.string.upper(), Mods.string.maxLen(2)] }),
  firstName: Parsers.defined(Parsers.string({})),
  lastName: Parsers.definedLazy(Parsers.string({}), () => 'unknown'),
  middleName: Parsers.string({}),
  employer: Parsers.defined(Parsers.string({}), 'unknown'),
  inventory: (v) => (Array.isArray(v) ? v : undefined),

  // equivalent of `Parsers.number({})`
  age: (v) => (typeof v === 'number' ? v : undefined),
};

// optional
const validators: DTValidators<Person> = {
  state: Validators.defined(),
  firstName: Validators.strings.maxLen(3),
  lastName: Validators.strings.maxLen(3),
  middleName: null, // don't validate
  inventory: (v) => ((v === undefined || v.length > 0) ? undefined : 'Must have at least one item'),
  age: Validators.defined([Validators.numbers.max(3)]),
  employer: Validators.defined(),
};

class Person extends DTClass<Person> {
  firstName!: string // required
  lastName!: string // required
  middleName?: string // optional
  employer?: string // optional
  age?: number // optional
  state?: string // optional
  inventory?: string[] // optional

  // important!
  constructor(params: DTMembers<Person>) {
    super({
      parsers, // required
      validators, // optional
    });
    this.assign(params);
  }
}

const person = new Person({
  age: 100,
  state: 'Florida',
  firstName: 'bobby',
  lastName: 'jackson',
  middleName: 'john',
});
console.log(person);
/*
  Person {
    age: 100,
    state: 'FL',
    firstName: 'bobby',
    lastName: 'jackson',
    middleName: 'john',
    employer: 'unknown'
  }
 */

const employedPerson = person.copy({
  employer: 'self',
  lastName: undefined,
  state: 'Alaska',
});
console.log(employedPerson);
/*
  Person {
    age: 100,
    state: 'AL',
    firstName: 'bobby',
    lastName: 'unknown',
    middleName: 'john',
    employer: 'self'
  }
 */

const parsedPerson = Person.parse({
  firstName: 'larry',
  middleName: 'j',
  lastName: 'johnson',
  randomField: 'this field should be ignored',
  age: 42,
  state: 'Massachusetts',
});
console.log(parsedPerson);
/*
  Person {
    age: 42,
    state: 'MA',
    firstName: 'larry',
    lastName: 'johnson',
    middleName: 'j',
    employer: 'unknown'
  }
*/
