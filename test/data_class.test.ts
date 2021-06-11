// eslint-disable-next-line max-classes-per-file
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import DClass from '../src/data_class';
import { Defined, NumberParser, StringParser } from '../src/parsers';

class Person extends DClass<Person> {
  firstName!: string
  lastName!: string
  middleName?: string
  employer?: string
  age!: number
}

Person.setParsers({
  age: Defined(NumberParser({ min: 0, max: 100 })),
  firstName: Defined(StringParser({})),
  lastName: Defined(StringParser({}), 'unknown'),
  middleName: StringParser({}),
  employer: Defined(StringParser({}), 'unknown'),
});

class WithoutParsers extends DClass<WithoutParsers> {
  name!: string
}

const correctParams = {
  age: 12, employer: 'e', firstName: 'fn', lastName: 'ln', middleName: 'mn',
};

describe('DClass constructor tests', () => {
  it('should instantiate a class when all params are provided', () => {
    const person = new Person(correctParams);
    expect(person).to.contain(correctParams);
  });

  it('should correctly use defaults', () => {
    const person = new Person({ ...correctParams, employer: undefined });
    expect(person).to.contain({ ...correctParams, employer: 'unknown' });
  });

  it('should correctly throw an error if no default is provided', () => {
    expect(() => new Person({ ...correctParams, firstName: undefined })).to.throw();
  });

  it('should correctly throw an error if parsers not set', () => {
    expect(() => new WithoutParsers({ name: 'oof' })).to.throw();
  });
});

describe('DClass copyWith tests', () => {
  let person: Person;

  beforeEach(() => {
    person = new Person(correctParams);
  });

  it('should make a copy of a class if no copyWith params provided', () => {
    const newPerson = person.copyWith({});
    expect(newPerson).to.include(person);
    expect(person).to.include(person);
  });

  it('should make a copy of a class with new params', () => {
    const newPerson = person.copyWith({ lastName: 'new ls' });
    expect(newPerson).to.include({ ...person, lastName: 'new ls' });
    expect(person).to.include(person);
    expect(person).to.include(person);
  });

  it('should make a copy of a class with defaults if undefined passed in', () => {
    const newPerson = person.copyWith({ lastName: undefined });
    expect(newPerson).to.include({ ...person, lastName: 'unknown' });
    expect(person).to.include(person);
  });

  it('should throw if required value is explicitly undefined', () => {
    expect(() => person.copyWith({ firstName: undefined })).to.throw();
  });
});

describe('DClass parse tests', () => {
  it('should not include values that arent defined in the parser and use defaults', () => {
    const goodValues = { firstName: 'fn', age: 42 };
    const badValues = { dog: 'molly', cat: 'jack' };
    const person = Person.parse({
      ...goodValues, ...badValues,
    });

    expect(person).to.include({ ...goodValues, lastName: 'unknown' });
    expect(person).to.not.include(badValues);
  });

  it('should throw if default not provided for a missing value', () => {
    // missing firstName
    expect(() => Person.parse({ lastName: 'l', age: 42, employer: 'john' })).to.throw();
  });
});
