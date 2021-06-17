// eslint-disable-next-line max-classes-per-file
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import DTClass, {
  DTMembers,
  DTParsers,
  Defined, DefinedLazy, NumberMods, NumberParser, StringMods, StringParser, DTParams, Validators,
} from '../src';
import { DTValidators } from '../src/data_class';

const parsers: DTParsers<Person> = {
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
  lastName: DefinedLazy(StringParser({}), () => 'unknown'),
  middleName: StringParser({}),
  employer: Defined(StringParser({}), 'unknown'),
  inventory: (v) => (Array.isArray(v) ? v : undefined),
};

class Person extends DTClass<Person> {
  firstName!: string
  lastName!: string
  middleName?: string
  employer?: string
  state?: string
  age!: number
  inventory?: string[]

  constructor(params: DTMembers<Person>) {
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

describe('DTClass constructor', () => {
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

describe('DTClass copies', () => {
  const copyParams: Partial<DTMembers<Person>> = {
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
describe('DTClass parsing', () => {
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

  describe('tryCreate', () => {
    it('should not include values that arent defined in the parser and use defaults', () => {
      const person = Person.tryCreate({
        ...getCorrectParams(), ...getUnrelatedValues(),
      });

      expect(person.equals(getExpectedParams())).to.eq(true);
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

describe('DTClass empty', () => {
  const smolParsers: DTParsers<SmolPerson> = {
    name: Defined(StringParser({}), 'default name'),
    age: NumberParser({}),
  };

  class SmolPerson extends DTClass<SmolPerson> {
    name: string
    age?: number | undefined

    constructor(params: DTMembers<SmolPerson>) {
      super(smolParsers);
      this.assign(params);
    }
  }

  it('should create an empty field with defaults', () => {
    const person = SmolPerson.empty();
    expect(person.equals({ name: 'default name', age: undefined }));
  });

  it('should create an empty field with defaults and provided params', () => {
    const person = SmolPerson.empty({ age: 42 });
    expect(person.equals({ name: 'default name', age: 42 }));
  });
});

describe('DTClass validations', () => {
  const catParsers: DTParsers<Cat> = {
    name: Defined(StringParser({})),
    age: NumberParser({}),
    breed: StringParser({}),
  };

  const catValidators: DTValidators<Cat> = {
    name: Validators.strings.maxLen(3),
    age: Validators.numbers.max(3),
    breed: null,
  };

  class Cat extends DTClass<Cat> {
    name: string
    breed: string
    age?: number

    constructor(params: DTParams<Cat>) {
      super(catParsers, { validators: catValidators });
      this.assign(params);
    }
  }

  const validCat = new Cat({
    breed: 'Breedy McBreed',
    name: 'Ace',
    age: 3,
  });

  const invalidCat1 = new Cat({
    breed: 'Breedy McBreed',
    name: 'Acer', // too long
    age: 3,
  });

  const invalidCat2 = new Cat({
    breed: 'Breedy McBreed',
    name: 'Ace',
    age: 4, // too big
  });

  it('should return valid for valid objects and invalid for invalid', () => {
    expect(validCat.isValid).to.eq(true);
    expect(invalidCat1.isValid).to.eq(false);
    expect(invalidCat2.isValid).to.eq(false);
  });

  it('should return whats invalid about an object key', () => {
    expect(validCat.validate('name')).to.eq(undefined);
    expect(validCat.validate('age')).to.eq(undefined);

    expect(invalidCat1.validate('name')).to.include('at most');
    expect(invalidCat1.validate('age')).to.eq(undefined);

    expect(invalidCat2.validate('age')).to.include('at most');
    expect(invalidCat2.validate('name')).to.eq(undefined);
  });

  it('should return whats invalid about the object when key is not provided', () => {
    expect(validCat.validate()).to.eq(undefined);
    expect(invalidCat2.validate()).to.include('at most');
    expect(invalidCat1.validate()).to.include('at most');
  });

  it('should throw an error if validation requested for a field with no validator', () => {
    expect(() => validCat.validate('breed')).to.throw();
    expect(() => invalidCat1.validate('breed')).to.throw();
    expect(() => invalidCat2.validate('breed')).to.throw();
  });
});
