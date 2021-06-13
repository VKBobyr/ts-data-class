// eslint-disable-next-line max-classes-per-file
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
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
  state: StringParser({ modifiers: [StringMods.upper(), StringMods.maxLen(2)] }),
  firstName: Defined(StringParser({})),
  lastName: Defined(StringParser({}), 'unknown'),
  middleName: StringParser({}),
  employer: Defined(StringParser({}), 'unknown'),
  inventory: (v) => (Array.isArray(v) ? v : undefined),
};

class Person extends DClass<Person> {
  firstName!: string
  lastName!: string
  middleName?: string
  employer?: string
  state?: string
  age!: number
  inventory?: string[]

  constructor(params: DClassMembers<Person>) {
    super(parsers);
    this.assign(params);
  }
}

const getCorrectParams = () => ({
  age: 12, employer: 'e', firstName: 'fn', lastName: 'ln', middleName: 'mn', state: 'Florida', inventory: ['item 1'],
});

const getExpectedParams = () => ({
  age: 12, employer: 'e', firstName: 'fn', lastName: 'ln', middleName: 'mn', state: 'FL', inventory: ['item 1'],
});

const getParamsWithNoDefault = () => ({
  ...getCorrectParams(), firstName: undefined,
});

describe('DClass constructor', () => {
  it('should instantiate a class when all params are provided', () => {
    const person = new Person(getCorrectParams());
    expect(person.equals(getExpectedParams())).to.eq(true);
  });

  it('should correctly use defaults', () => {
    const person = new Person({ ...getCorrectParams(), employer: undefined });
    expect(person.equals({ ...getExpectedParams(), employer: 'unknown' })).to.eq(true);
  });

  it('should correctly throw an error if no default is provided', () => {
    expect(() => new Person(getParamsWithNoDefault())).to.throw();
  });

  it('should throw if params is not an object', () => {
    expect(() => new Person(undefined)).to.throw();
    expect(() => new Person(null)).to.throw();
    expect(() => new Person(4)).to.throw();
    expect(() => new Person('hello')).to.throw();
  });
});

describe('DClass copies', () => {
  const copyParams: Partial<DClassMembers<Person>> = {
    firstName: 'drake',
    state: 'Washington',
  };

  const expectedCopyParams = {
    ...getExpectedParams(),
    firstName: 'drake',
    state: 'WA',
  };

  let person: Person;
  let personSameCopy: Person;
  let personParamCopy: Person;

  describe('shallow', () => {
    beforeEach(() => {
      person = new Person(getCorrectParams());
      personSameCopy = person.copy();
      personParamCopy = person.copy(copyParams);
    });

    it('should make a copy of a class if no copy params provided', () => {
      expect(person.equals(personSameCopy)).to.eq(true);
    });

    it('should make a copy of a class with new params and apply formatters', () => {
      expect(person.equals(personParamCopy)).to.eq(false);
      expect(personParamCopy.equals(expectedCopyParams));
    });

    it('should make a copy of a class with defaults if undefined passed in', () => {
      const newPerson = person.copy({ lastName: undefined });
      expect(newPerson.equals(({ ...person, lastName: 'unknown' }))).to.eq(true);
    });

    it('should throw if required value is explicitly undefined', () => {
      expect(() => person.copy({ firstName: undefined })).to.throw();
    });

    it('should throw if params does not extend object', () => {
      expect(() => person.copy(null)).to.throw();
      expect(() => person.copy(4)).to.throw();
      expect(() => person.copy('hello')).to.throw();
    });

    it('should be a shallow copy', () => {
      const personCopy = person.copy({ firstName: 'drake' });
      person.inventory.push('item 2');
      expect(person.inventory).to.eq(personCopy.inventory);
    });
  });

  describe('deep', () => {
    beforeEach(() => {
      person = new Person(getCorrectParams());
      personSameCopy = person.deepCopy();
      personParamCopy = person.deepCopy(copyParams);
    });

    it('should make a copy of a class if no copy params provided', () => {
      expect(person.equals((personSameCopy))).to.eq(true);
    });

    it('should make a copy of a class with new params and apply formatters', () => {
      expect(person.equals(personParamCopy)).to.eq(false);
      expect(personParamCopy.equals(expectedCopyParams));
    });

    it('should make a copy of a class with defaults if undefined passed in', () => {
      const newPerson = person.deepCopy({ lastName: undefined });
      expect(newPerson.equals(({ ...person, lastName: 'unknown' }))).to.eq(true);
    });

    it('should throw if required value is explicitly undefined', () => {
      expect(() => person.deepCopy({ firstName: undefined })).to.throw();
    });

    it('should throw if params does not extend object', () => {
      expect(() => person.deepCopy(null)).to.throw();
      expect(() => person.deepCopy(4)).to.throw();
      expect(() => person.deepCopy('hello')).to.throw();
    });

    it('should be a deep copy', () => {
      const personCopy = person.deepCopy({ firstName: 'drake' });
      person.inventory.push('item 2');
      expect(person.inventory).to.not.eq(personCopy.inventory);
    });
  });
});
describe('DClass parsing', () => {
  const getUnrelatedValues = () => ({ dog: 'molly', cat: 'jack' });

  describe('parse', () => {
    it('should not include values that arent defined in the parser and use defaults', () => {
      const person = Person.parse({
        ...getCorrectParams(), ...getUnrelatedValues(),
      });

      expect(person.equals(getExpectedParams())).to.eq(true);
      expect(person).to.not.include(getUnrelatedValues());
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

  describe('tryParse', () => {
    it('should not include values that arent defined in the parser and use defaults', () => {
      const person = Person.tryParse({
        ...getCorrectParams(), ...getUnrelatedValues(),
      });

      expect(person.equals(getExpectedParams())).to.eq(true);
      expect(person).to.not.include(getUnrelatedValues());
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
});

describe('DClass equals', () => {
  const person = new Person(getCorrectParams());
  const personParams = { ...person };

  it('should return true as long as members match', () => {
    expect(person.equals(personParams)).to.eq(true);
  });

  it('should return true even if nullable value is missing', () => {
    const p1 = person.copy({ state: undefined });
    const members = { ...p1 };
    delete members.state;
    expect(p1.equals(members)).to.eq(true);
  });

  it('should return false if members dont match', () => {
    expect(person.equals({ ...personParams, firstName: 'bambi' })).to.eq(false);
  });

  it("should return false if passed-in value doesn't have expected members", () => {
    expect(person.equals({ })).to.eq(false);
  });

  it('should return false if passed-in value is of irrelevant type', () => {
    expect(person.equals(null)).to.eq(false);
    expect(person.equals(undefined)).to.eq(false);
    expect(person.equals(false)).to.eq(false);
    expect(person.equals(4)).to.eq(false);
    expect(person.equals('43')).to.eq(false);
  });
});
