import DClass, {
  DClassMembers,
  DClassParsers,
  Defined, NumberMods, NumberParser, StringMods, StringParser,
} from '../src';

const parsers: DClassParsers<Person> = {
  age: Defined(
    NumberParser({
      modifiers: [
        NumberMods.minMax({ min: 0, max: 100 }),
        NumberMods.round(1),
      ],
    }),
  ),
  state: Defined(
    StringParser({
      modifiers: [
        StringMods.upper(),
        StringMods.maxLen(2)],
    }),
  ),
  firstName: Defined(StringParser({})),
  lastName: Defined(StringParser({}), 'unknown'),
  middleName: StringParser({}),
  employer: Defined(StringParser({}), 'unknown'),
};

class Person extends DClass<Person> {
  firstName!: string // required
  lastName!: string // required
  age!: number // required
  middleName?: string // optional
  employer?: string // optional
  state?: string; // optional

  constructor(params: DClassMembers<Person>) {
    super(parsers);
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

const employedPerson = person.copyWith({
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
