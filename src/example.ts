import DClass, {
  Defined, NumberMods, NumberParser, StringMods, StringParser,
} from '..';

class Person extends DClass<Person> {
  firstName!: string // required
  lastName!: string // required
  age!: number // required
  middleName: string | undefined // optional
  employer: string | undefined // optional
  state: string | undefined // optional
}

Person.setParsers({
  age: Defined(
    NumberParser({
      modifiers: [
        NumberMods.minMax({ min: 0, max: 100 }),
        NumberMods.round(1),
      ],
    }),
  ),
  state: Defined(StringParser({ modifiers: [StringMods.upper(), StringMods.maxLen(2)] })),
  firstName: Defined(StringParser({})),
  lastName: Defined(StringParser({}), 'unknown'),
  middleName: StringParser({}),
  employer: Defined(StringParser({}), 'unknown'),
});

const person = new Person({
  firstName: 'bobby',
  middleName: 'john',
  lastName: 'jackson',
  age: 102, // will be clamped to 100 by parser
  state: 'Florida', // will be clamped to len 2 and made uppercase
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
