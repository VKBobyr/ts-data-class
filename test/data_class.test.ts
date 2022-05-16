/* eslint-disable max-classes-per-file */
// @ts-nocheck
// eslint-disable-next-line max-classes-per-file

import { DTMembers } from "../src";
import {
  EmptyablePerson,
  getCorrectValidParams,
  getIncorrectParams,
  getParsedParams,
  Person,
} from "./test_classes";

describe("DTClass constructor", () => {
  it("should instantiate a class when all params are provided", () => {
    const person = new Person(getCorrectValidParams());
    expect(person.equals(getParsedParams())).toBe(true);
  });

  it("should correctly throw an error if no default is provided", () => {
    expect(() => new Person(getIncorrectParams())).toThrow();
  });

  it("should throw if params is not an object", () => {
    expect(() => new Person(undefined)).toThrow();
    expect(() => new Person(null)).toThrow();
    expect(() => new Person(4)).toThrow();
    expect(() => new Person("hello")).toThrow();
    expect(() => new Person()).toThrow();
  });
});

describe("DTClass copies", () => {
  const copyParams: Partial<DTMembers<Person>> = {
    firstName: "drake",
    state: "Washington",
  };

  const expectedCopyParams = {
    ...getParsedParams(),
    firstName: "drake",
    state: "WA",
  };

  let person: Person;
  let personSameCopy: Person;
  let personParamCopy: Person;

  describe("shallow", () => {
    beforeEach(() => {
      person = new Person(getCorrectValidParams());
      personSameCopy = person.copy();
      personParamCopy = person.copy(copyParams);
    });

    it("should make a copy of a class if no copy params provided", () => {
      expect(person.equals(personSameCopy)).toBe(true);
    });

    it("should make a copy of a class with new params and apply formatters", () => {
      expect(person.equals(personParamCopy)).toBe(false);
      expect(personParamCopy.equals(expectedCopyParams));
    });

    it("should make a copy of a class with defaults if undefined passed in", () => {
      const newPerson = person.copy({ lastName: undefined });
      expect(newPerson.equals({ ...person, lastName: "unknown" })).toBe(true);
    });

    it("should throw if required value is explicitly undefined", () => {
      expect(() => person.copy({ firstName: undefined })).toThrow();
    });

    it("should throw if params does not extend object", () => {
      expect(() => person.copy(null)).toThrow();
      expect(() => person.copy(4)).toThrow();
      expect(() => person.copy("hello")).toThrow();
    });
  });

  describe("deep", () => {
    beforeEach(() => {
      person = new Person(getCorrectValidParams());
      personSameCopy = person.deepCopy();
      personParamCopy = person.deepCopy(copyParams);
    });

    it("should make a copy of a class if no copy params provided", () => {
      expect(person.equals(personSameCopy)).toBe(true);
    });

    it("should make a copy of a class with new params and apply formatters", () => {
      expect(person.equals(personParamCopy)).toBe(false);
      expect(personParamCopy.equals(expectedCopyParams));
    });

    it("should make a copy of a class with defaults if undefined passed in", () => {
      const newPerson = person.deepCopy({ lastName: undefined });
      expect(newPerson.equals({ ...person, lastName: "unknown" })).toBe(true);
    });

    it("should throw if required value is explicitly undefined", () => {
      expect(() => person.deepCopy({ firstName: undefined })).toThrow();
    });

    it("should throw if params does not extend object", () => {
      expect(() => person.deepCopy(null)).toThrow();
      expect(() => person.deepCopy(4)).toThrow();
      expect(() => person.deepCopy("hello")).toThrow();
    });

    it("should be a deep copy", () => {
      const personCopy = person.deepCopy({ firstName: "drake" });
      person.inventory.push("item 2");
      expect(person.inventory).not.toEqual(personCopy.inventory);
    });
  });
});
describe("DTClass parsing", () => {
  const getUnrelatedValues = () => ({ dog: "molly", cat: "jack" });

  describe("parse", () => {
    it("should not include values that arent defined in the parser and use defaults", () => {
      const person = Person.parse({
        ...getCorrectValidParams(),
        ...getUnrelatedValues(),
      });

      expect(person.equals(getParsedParams())).toBe(true);
      expect(person).not.toContain(getUnrelatedValues());
    });

    it("should throw if default not provided for a missing value", () => {
      // missing firstName
      expect(() =>
        Person.parse({ lastName: "l", age: 42, employer: "john" })
      ).toThrow();
    });

    it("should throw if params is not an object", () => {
      expect(() => Person.parse(undefined)).toThrow();
      expect(() => Person.parse(null)).toThrow();
      expect(() => Person.parse(4)).toThrow();
      expect(() => Person.parse("hello")).toThrow();
    });
  });

  describe("tryParse", () => {
    it("should not include values that arent defined in the parser and use defaults", () => {
      const person = Person.tryParse({
        ...getCorrectValidParams(),
        ...getUnrelatedValues(),
      });

      expect(person.equals(getParsedParams())).toBe(true);
      expect(person).not.toContain(getUnrelatedValues());
    });

    it("should return undefined if default not provided for a missing value", () => {
      // missing firstName
      expect(
        Person.tryParse({ lastName: "l", age: 42, employer: "john" })
      ).toBe(undefined);
    });

    it("should return undefined if params is not an object", () => {
      expect(Person.tryParse(undefined)).toBe(undefined);
      expect(Person.tryParse(null)).toBe(undefined);
      expect(Person.tryParse(4)).toBe(undefined);
      expect(Person.tryParse("hello")).toBe(undefined);
    });
  });
});

describe("DTClass equals", () => {
  const person = new Person(getCorrectValidParams());
  const personParams = { ...person };

  it("should return true as long as members match", () => {
    expect(person.equals(personParams)).toBe(true);
  });

  it("should return true even if nullable value is missing", () => {
    const p1 = person.copy({ state: undefined });
    const members = { ...p1 };
    delete members.state;
    expect(p1.equals(members)).toBe(true);
  });

  it("should return false if members dont match", () => {
    expect(person.equals({ ...personParams, firstName: "bambi" })).toBe(false);
  });

  it("should return false if passed-in value doesn't have expected members", () => {
    expect(person.equals({})).toBe(false);
  });

  it("should return false if passed-in value is of irrelevant type", () => {
    expect(person.equals(null)).toBe(false);
    expect(person.equals(undefined)).toBe(false);
    expect(person.equals(false)).toBe(false);
    expect(person.equals(4)).toBe(false);
    expect(person.equals("43")).toBe(false);
  });
});

describe("DTClass empty", () => {
  it("should create an empty field with defaults", () => {
    const person = EmptyablePerson.empty();
    expect(person.equals({ name: "default name", age: undefined })).toBe(true);
  });

  it("should create an empty field with defaults and provided params", () => {
    const person = EmptyablePerson.empty({ age: 42 });
    expect(person.equals({ name: "default name", age: 42 })).toBe(true);
  });

  it("should throw an error if default is required", () => {
    expect(() => Person.empty()).toThrow();
  });

  it("should use all values if provided", () => {
    const params = { name: "josh", age: 42 };
    const person = EmptyablePerson.empty(params);
    expect(person.equals(params)).toBe(true);
  });
});
