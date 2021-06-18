// eslint-disable-next-line max-classes-per-file
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import isEqual from 'lodash.isequal';
import {
  DTMembers,
} from '../src';
import {
  EmptyablePerson,
  getCorrectValidParams, getIncorrectParams,
  getInvalidParams, getParsedParams, invalidParamValidation, Person,
} from './test_classes';

describe('DTClass constructor', () => {
  it('should instantiate a class when all params are provided', () => {
    const person = new Person(getCorrectValidParams());
    expect(person.equals(getParsedParams())).to.eq(true);
  });

  it('should correctly throw an error if no default is provided', () => {
    expect(() => new Person(getIncorrectParams())).to.throw();
  });

  it('should throw if params is not an object', () => {
    expect(() => new Person(undefined)).to.throw();
    expect(() => new Person(null)).to.throw();
    expect(() => new Person(4)).to.throw();
    expect(() => new Person('hello')).to.throw();
    expect(() => new Person()).to.throw();
  });
});

describe('DTClass copies', () => {
  const copyParams: Partial<DTMembers<Person>> = {
    firstName: 'drake',
    state: 'Washington',
  };

  const expectedCopyParams = {
    ...getParsedParams(),
    firstName: 'drake',
    state: 'WA',
  };

  let person: Person;
  let personSameCopy: Person;
  let personParamCopy: Person;

  describe('shallow', () => {
    beforeEach(() => {
      person = new Person(getCorrectValidParams());
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
      person = new Person(getCorrectValidParams());
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
describe('DTClass parsing', () => {
  const getUnrelatedValues = () => ({ dog: 'molly', cat: 'jack' });

  describe('parse', () => {
    it('should not include values that arent defined in the parser and use defaults', () => {
      const person = Person.parse({
        ...getCorrectValidParams(), ...getUnrelatedValues(),
      });

      expect(person.equals(getParsedParams())).to.eq(true);
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
        ...getCorrectValidParams(), ...getUnrelatedValues(),
      });

      expect(person.equals(getParsedParams())).to.eq(true);
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

  describe('tryCreate', () => {
    it('should not include values that arent defined in the parser and use defaults', () => {
      const person = Person.tryCreate({
        ...getCorrectValidParams(), ...getUnrelatedValues(),
      });

      expect(person.equals(getParsedParams())).to.eq(true);
      expect(person).to.not.include(getUnrelatedValues());
    });

    it('should return undefined if default not provided for a missing value', () => {
      // missing firstName
      expect(Person.tryCreate({ lastName: 'l', age: 42, employer: 'john' })).to.eq(undefined);
    });

    it('should return undefined if params is not an object', () => {
      expect(Person.tryCreate(undefined)).to.eq(undefined);
      expect(Person.tryCreate(null)).to.eq(undefined);
      expect(Person.tryCreate(4)).to.eq(undefined);
      expect(Person.tryCreate('hello')).to.eq(undefined);
    });
  });
});

describe('DTClass equals', () => {
  const person = new Person(getCorrectValidParams());
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

describe('DTClass empty', () => {
  it('should create an empty field with defaults', () => {
    const person = EmptyablePerson.empty();
    expect(person.equals({ name: 'default name', age: undefined })).to.eq(true);
  });

  it('should create an empty field with defaults and provided params', () => {
    const person = EmptyablePerson.empty({ age: 42 });
    expect(person.equals({ name: 'default name', age: 42 })).to.eq(true);
  });

  it('should throw an error if default is required', () => {
    expect(() => Person.empty()).to.throw();
  });
});

describe('DTClass validations', () => {
  const validPerson = new Person(getCorrectValidParams());
  const invalidPerson = new Person(getInvalidParams());

  it('should return valid for valid objects and invalid for invalid', () => {
    expect(validPerson.isValid).to.eq(true);
    expect(invalidPerson.isValid).to.eq(false);
  });

  it('should throw for members that dont have validators', () => {
    expect(() => validPerson.validateMember('middleName')).to.throw();
  });

  it('should return undefined for valid members', () => {
    expect(validPerson.validateMember('state')).to.eq(undefined);
    expect(validPerson.validateMember('firstName')).to.eq(undefined);
    expect(validPerson.validateMember('lastName')).to.eq(undefined);
    expect(validPerson.validateMember('inventory')).to.eq(undefined);
    expect(validPerson.validateMember('age')).to.eq(undefined);
    expect(validPerson.validateMember('employer')).to.eq(undefined);
  });

  it('should return the error for invalid members', () => {
    expect(invalidPerson.validateMember('state')).to.eq(invalidParamValidation.state);
    expect(invalidPerson.validateMember('firstName')).to.eq(invalidParamValidation.firstName);
    expect(invalidPerson.validateMember('lastName')).to.eq(invalidParamValidation.lastName);
    expect(invalidPerson.validateMember('inventory')).to.eq(invalidParamValidation.inventory);
    expect(invalidPerson.validateMember('age')).to.eq(invalidParamValidation.age);
    expect(invalidPerson.validateMember('employer')).to.eq(invalidParamValidation.employer);
  });

  it('should return whats invalid about the object when key is not provided', () => {
    expect(isEqual(invalidPerson.validate(), invalidParamValidation));
    expect(isEqual(validPerson.validate(), undefined));
  });
});
