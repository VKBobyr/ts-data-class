import DTClass, {
  DTMembers,
  DTParsers,
  Mods,
  Parsers,
} from '../src';

const parsers: DTParsers<Person> = {
  age: Parsers.defined(
    Parsers.number({
      modifiers: [
        Mods.number.minMax({ min: 0, max: 100 }),
        Mods.number.round(1),
      ],
    }),
  ),
  state: Parsers.defined(
    Parsers.string({
      modifiers: [
        Mods.string.upper(),
        Mods.string.maxLen(2)],
    }),
  ),
  firstName: Parsers.defined(Parsers.string({})),
  lastName: Parsers.defined(Parsers.string({}), 'unknown'),
  middleName: Parsers.string({}),
  employer: Parsers.defined(Parsers.string({}), 'unknown'),
};

class Person extends DTClass<Person> {
  firstName!: string // required
  lastName!: string // required
  age!: number // required
  middleName?: string // optional
  employer?: string // optional
  state?: string; // optional

  constructor(params: DTMembers<Person>) {
    super(parsers);
    this.assign(params);
  }

  introduceThyself() {
    console.log(`My name is ${this.firstName}`);
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
