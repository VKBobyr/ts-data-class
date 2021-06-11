import {
  Defined, ModStringUpper, NumberParser, StringParser,
} from '..';
import DClass from './data_class';
import { ModNumberMinMax, ModNumberRound } from './parsers/number_parser';
import { ModStringMaxLen } from './parsers/string_parser';

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
        ModNumberMinMax({ min: 0, max: 100 }),
        ModNumberRound(1),
      ],
    }),
  ),
  state: Defined(StringParser({ modifiers: [ModStringUpper(), ModStringMaxLen(2)] })),
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
