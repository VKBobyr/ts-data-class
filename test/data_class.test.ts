// eslint-disable-next-line max-classes-per-file
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import DClass, {
  DClassParams,
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
  state: Defined(StringParser({ modifiers: [StringMods.upper(), StringMods.maxLen(2)] })),
  firstName: Defined(StringParser({})),
  lastName: Defined(StringParser({}), 'unknown'),
  middleName: StringParser({}),
  employer: Defined(StringParser({}), 'unknown'),
};

class Person extends DClass<Person> {
  firstName!: string
  lastName!: string
  middleName?: string
  employer?: string
  state?: string
  age!: number

  constructor(params: DClassParams<Person>) {
    super(parsers);
    this.assign(params);
  }
}

const correctParams = {
  age: 12, employer: 'e', firstName: 'fn', lastName: 'ln', middleName: 'mn', state: 'Florida',
};
const expectedParams = {
  age: 12, employer: 'e', firstName: 'fn', lastName: 'ln', middleName: 'mn', state: 'FL',
};

describe('DClass constructor tests', () => {
  it('should instantiate a class when all params are provided', () => {
    const person = new Person(correctParams);
    expect(person).to.contain(expectedParams);
  });

  it('should correctly use defaults', () => {
    const person = new Person({ ...correctParams, employer: undefined });
    expect(person).to.contain({ ...expectedParams, employer: 'unknown' });
  });

  it('should correctly throw an error if no default is provided', () => {
    expect(() => new Person({ ...correctParams, firstName: undefined })).to.throw();
  });

  it('should throw if params is not an object', () => {
    expect(() => new Person(undefined)).to.throw();
    expect(() => new Person(null)).to.throw();
    expect(() => new Person(4)).to.throw();
    expect(() => new Person('hello')).to.throw();
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

  it('should throw if params does not extend object', () => {
    expect(() => person.copyWith(undefined)).to.throw();
    expect(() => person.copyWith(null)).to.throw();
    expect(() => person.copyWith(4)).to.throw();
    expect(() => person.copyWith('hello')).to.throw();
  });
});

describe('DClass parse tests', () => {
  it('should not include values that arent defined in the parser and use defaults', () => {
    const badValues = { dog: 'molly', cat: 'jack' };
    const person = Person.parse({
      ...correctParams, ...badValues,
    });

    expect(person).to.include({ ...expectedParams });
    expect(person).to.not.include(badValues);
  });

  it('should throw if default not provided for a missing value', () => {
    // missing firstName
    expect(() => Person.parse({ lastName: 'l', age: 42, employer: 'john' })).to.throw();
  });

  it('should throw if params is not an object', () => {
    expect(() => Person.parse(undefined)).to.throw();
    expect(() => Person.parse(null)).to.throw();
    expect(() => Person.parse(4)).to.throw();
    expect(() => Person.parse('hello')).to.throw();
  });
});

describe('DClass tryParse tests', () => {
  it('should not include values that arent defined in the parser and use defaults', () => {
    const badValues = { dog: 'molly', cat: 'jack' };
    const person = Person.tryParse({
      ...correctParams, ...badValues,
    });

    expect(person).to.include({ ...expectedParams });
    expect(person).to.not.include(badValues);
  });

  it('should return undefined if default not provided for a missing value', () => {
    // missing firstName
    expect(Person.tryParse({ lastName: 'l', age: 42, employer: 'john' })).to.eq(undefined);
  });

  it('should return undefined if params is not an object', () => {
    expect(Person.tryParse(undefined)).to.eq(undefined);
    expect(Person.tryParse(null)).to.eq(undefined);
    expect(Person.tryParse(4)).to.eq(undefined);
    expect(Person.tryParse('hello')).to.eq(undefined);
  });
});
