/* eslint-disable max-classes-per-file */
// @ts-nocheck
// eslint-disable-next-line max-classes-per-file

import isEqual from 'lodash.isequal';
import DTClass, { DTMembers, DTParams } from '../src';
import {
  EmptyablePerson,
  getCorrectValidParams,
  getIncorrectParams,
  getInvalidParams,
  getParsedParams,
  invalidParamValidation,
  Person,
} from './test_classes';

describe('DTClass constructor', () => {
  test('should throw error when no params are passed', () => {
    class NoParserClass extends DTClass<NoParserClass> {
      constructor() {
        super({ parsers: {} });
        this.assign(undefined);
      }
    }

    expect(() => new NoParserClass()).toThrowError();
  });

  test('should ignore member parsers for ', () => {
    class NoParserClass extends DTClass<NoParserClass> {
      constructor(params: DTParams<NoParserClass>) {
        super({});
        this.assign(params);
      }
    }

    expect(() => new NoParserClass()).toThrowError();
  });

  test('should throw error when no validators are passed', () => {
    class NoValidatorsClass extends DTClass<NoValidatorsClass> {
      field?: number

      constructor(params: DTParams<NoValidatorsClass>) {
        super({
          parsers: { field: (v) => v as number },
        });
        this.assign(params);
      }
    }

    expect(() => {
      new NoValidatorsClass({ field: 2 }).validate();
    }).toThrowError();
  });

  test('should throw error when validator missing for field', () => {
    class NoValidatorsClass extends DTClass<NoValidatorsClass> {
      field1?: number
      field2?: number

      constructor(params: DTParams<NoValidatorsClass>) {
        super({
          parsers: { field1: (v) => v as number, field2: (v) => v as number },
          validators: {
            field1: () => 'nope',
          },
        });
        this.assign(params);
      }
    }

    expect(() => {
      new NoValidatorsClass({ }).validateMember('field1');
    }).not.toThrowError();

    expect(() => {
      new NoValidatorsClass({ }).validateMember('field2');
    }).toThrowError();
  });

  test('should instantiate a class when all params are provided', () => {
    const person = new Person(getCorrectValidParams());
    expect(person.equals(getParsedParams())).toBe(true);
  });

  test('should correctly throw an error if no default is provided', () => {
    expect(() => new Person(getIncorrectParams())).toThrow();
  });

  test('should throw if params is not an object', () => {
    expect(() => new Person(undefined)).toThrow();
    expect(() => new Person(null)).toThrow();
    expect(() => new Person(4)).toThrow();
    expect(() => new Person('hello')).toThrow();
    expect(() => new Person()).toThrow();
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

    test('should make a copy of a class if no copy params provided', () => {
      expect(person.equals(personSameCopy)).toBe(true);
    });

    test('should make a copy of a class with new params and apply formatters', () => {
      expect(person.equals(personParamCopy)).toBe(false);
      expect(personParamCopy.equals(expectedCopyParams));
    });

    test('should make a copy of a class with defaults if undefined passed in', () => {
      const newPerson = person.copy({ lastName: undefined });
      expect(newPerson.equals({ ...person, lastName: 'unknown' })).toBe(true);
    });

    test('should throw if required value is explicitly undefined', () => {
      expect(() => person.copy({ firstName: undefined })).toThrow();
    });

    test('should throw if params does not extend object', () => {
      expect(() => person.copy(null)).toThrow();
      expect(() => person.copy(4)).toThrow();
      expect(() => person.copy('hello')).toThrow();
    });

    test('should be a shallow copy', () => {
      const personCopy = person.copy({ firstName: 'drake' });
      person.inventory.push('item 2');
      expect(person.inventory).toBe(personCopy.inventory);
    });
  });

  describe('deep', () => {
    beforeEach(() => {
      person = new Person(getCorrectValidParams());
      personSameCopy = person.deepCopy();
      personParamCopy = person.deepCopy(copyParams);
    });

    test('should make a copy of a class if no copy params provided', () => {
      expect(person.equals(personSameCopy)).toBe(true);
    });

    test('should make a copy of a class with new params and apply formatters', () => {
      expect(person.equals(personParamCopy)).toBe(false);
      expect(personParamCopy.equals(expectedCopyParams));
    });

    test('should make a copy of a class with defaults if undefined passed in', () => {
      const newPerson = person.deepCopy({ lastName: undefined });
      expect(newPerson.equals({ ...person, lastName: 'unknown' })).toBe(true);
    });

    test('should throw if required value is explicitly undefined', () => {
      expect(() => person.deepCopy({ firstName: undefined })).toThrow();
    });

    test('should throw if params does not extend object', () => {
      expect(() => person.deepCopy(null)).toThrow();
      expect(() => person.deepCopy(4)).toThrow();
      expect(() => person.deepCopy('hello')).toThrow();
    });

    test('should be a deep copy', () => {
      const personCopy = person.deepCopy({ firstName: 'drake' });
      person.inventory.push('item 2');
      expect(person.inventory).not.toEqual(personCopy.inventory);
    });
  });
});
describe('DTClass parsing', () => {
  const getUnrelatedValues = () => ({ dog: 'molly', cat: 'jack' });

  describe('parse', () => {
    test('should not include values that arent defined in the parser and use defaults', () => {
      const person = Person.parse({
        ...getCorrectValidParams(),
        ...getUnrelatedValues(),
      });

      expect(person.equals(getParsedParams())).toBe(true);
      expect(person).not.toContain(getUnrelatedValues());
    });

    test('should throw if default not provided for a missing value', () => {
      // missing firstName
      expect(() => Person.parse({ lastName: 'l', age: 42, employer: 'john' })).toThrow();
    });

    test('should throw if params is not an object', () => {
      expect(() => Person.parse(undefined)).toThrow();
      expect(() => Person.parse(null)).toThrow();
      expect(() => Person.parse(4)).toThrow();
      expect(() => Person.parse('hello')).toThrow();
    });
  });

  describe('tryParse', () => {
    test('should not include values that arent defined in the parser and use defaults', () => {
      const person = Person.tryParse({
        ...getCorrectValidParams(),
        ...getUnrelatedValues(),
      });

      expect(person.equals(getParsedParams())).toBe(true);
      expect(person).not.toContain(getUnrelatedValues());
    });

    test('should return undefined if default not provided for a missing value', () => {
      // missing firstName
      expect(
        Person.tryParse({ lastName: 'l', age: 42, employer: 'john' }),
      ).toBe(undefined);
    });

    test('should return undefined if params is not an object', () => {
      expect(Person.tryParse(undefined)).toBe(undefined);
      expect(Person.tryParse(null)).toBe(undefined);
      expect(Person.tryParse(4)).toBe(undefined);
      expect(Person.tryParse('hello')).toBe(undefined);
    });
  });

  describe('tryCreate', () => {
    test('should not include values that arent defined in the parser and use defaults', () => {
      const person = Person.tryCreate({
        ...getCorrectValidParams(),
        ...getUnrelatedValues(),
      });

      expect(person.equals(getParsedParams())).toBe(true);
      expect(person).not.toContain(getUnrelatedValues());
    });

    test('should return undefined if default not provided for a missing value', () => {
      // missing firstName
      expect(
        Person.tryCreate({ lastName: 'l', age: 42, employer: 'john' }),
      ).toBe(undefined);
    });

    test('should return undefined if params is not an object', () => {
      expect(Person.tryCreate(undefined)).toBe(undefined);
      expect(Person.tryCreate(null)).toBe(undefined);
      expect(Person.tryCreate(4)).toBe(undefined);
      expect(Person.tryCreate('hello')).toBe(undefined);
    });
  });
});

describe('DTClass equals', () => {
  const person = new Person(getCorrectValidParams());
  const personParams = { ...person };

  test('should return true as long as members match', () => {
    expect(person.equals(personParams)).toBe(true);
  });

  test('should return true even if nullable value is missing', () => {
    const p1 = person.copy({ state: undefined });
    const members = { ...p1 };
    delete members.state;
    expect(p1.equals(members)).toBe(true);
  });

  test('should return false if members dont match', () => {
    expect(person.equals({ ...personParams, firstName: 'bambi' })).toBe(false);
  });

  test("should return false if passed-in value doesn't have expected members", () => {
    expect(person.equals({})).toBe(false);
  });

  test('should return false if passed-in value is of irrelevant type', () => {
    expect(person.equals(null)).toBe(false);
    expect(person.equals(undefined)).toBe(false);
    expect(person.equals(false)).toBe(false);
    expect(person.equals(4)).toBe(false);
    expect(person.equals('43')).toBe(false);
  });
});

describe('DTClass empty', () => {
  test('should create an empty field with defaults', () => {
    const person = EmptyablePerson.empty();
    expect(person.equals({ name: 'default name', age: undefined })).toBe(true);
  });

  test('should create an empty field with defaults and provided params', () => {
    const person = EmptyablePerson.empty({ age: 42 });
    expect(person.equals({ name: 'default name', age: 42 })).toBe(true);
  });

  test('should throw an error if default is required', () => {
    expect(() => Person.empty()).toThrow();
  });
});

describe('DTClass validations', () => {
  const validPerson = new Person(getCorrectValidParams());
  const invalidPerson = new Person(getInvalidParams());

  test('should return valid for valid objects and invalid for invalid', () => {
    expect(validPerson.isValid).toBe(true);
    expect(invalidPerson.isValid).toBe(false);
  });

  test('should throw for members that dont have validators', () => {
    expect(() => validPerson.validateMember('middleName')).toThrow();
  });

  test('should return undefined for valid members', () => {
    expect(validPerson.validateMember('state')).toBe(undefined);
    expect(validPerson.validateMember('firstName')).toBe(undefined);
    expect(validPerson.validateMember('lastName')).toBe(undefined);
    expect(validPerson.validateMember('inventory')).toBe(undefined);
    expect(validPerson.validateMember('age')).toBe(undefined);
    expect(validPerson.validateMember('employer')).toBe(undefined);
  });

  test('should return the error for invalid members', () => {
    expect(invalidPerson.validateMember('state')).toBe(
      invalidParamValidation.state,
    );
    expect(invalidPerson.validateMember('firstName')).toBe(
      invalidParamValidation.firstName,
    );
    expect(invalidPerson.validateMember('lastName')).toBe(
      invalidParamValidation.lastName,
    );
    expect(invalidPerson.validateMember('inventory')).toBe(
      invalidParamValidation.inventory,
    );
    expect(invalidPerson.validateMember('age')).toBe(
      invalidParamValidation.age,
    );
    expect(invalidPerson.validateMember('employer')).toBe(
      invalidParamValidation.employer,
    );
  });

  test('should return whats invalid about the object when key is not provided', () => {
    expect(isEqual(invalidPerson.validate(), invalidParamValidation));
    expect(isEqual(validPerson.validate(), undefined));
  });
});
