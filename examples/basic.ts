import DTClass, { DTMembers, Parsers } from "../src";
import { DTParsers } from "../src/data_class";

class Person extends DTClass<Person> {
  firstName!: string; // required
  lastName!: string; // required
  middleName?: string; // optional
  employer?: string; // optional
  age?: number; // optional
  state?: string; // optional
  inventory?: string[];

  protected get parsers(): DTParsers<Person> {
    return {
      firstName: Parsers.definedString,
      lastName: (v) => Parsers.string(v) ?? "unknown",
      middleName: Parsers.string,
      employer: Parsers.string,
      age: (v) => Parsers.number(v),
      state: (v) => Parsers.string(v)?.substring(0, 2).toUpperCase(),
      inventory: (v) => Parsers.array(v, Parsers.definedString),
    };
  } // optional
}

const person = new Person({
  age: 100,
  state: "Florida",
  firstName: "bobby",
  lastName: "jackson",
  middleName: "john",
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
  employer: "self",
  lastName: undefined,
  state: "Alaska",
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
  firstName: "larry",
  middleName: "j",
  lastName: "johnson",
  randomField: "this field should be ignored",
  age: 42,
  state: "Massachusetts",
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
