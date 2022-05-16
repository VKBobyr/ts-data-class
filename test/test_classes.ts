/* eslint-disable max-classes-per-file */
import DTClass, { DTMembers, Parsers } from "../src";
import { DTParams, DTParsers, DTValidation } from "../src/data_class";

export class Person extends DTClass<Person> {
  firstName!: string;
  lastName!: string;
  middleName?: string;
  employer?: string;
  age?: number;
  state?: string;
  inventory?: string[];

  protected get parsers(): DTParsers<Person> {
    return {
      firstName: (v) => Parsers.definedString(v),
      lastName: (v) => Parsers.string(v) ?? "unknown",
      middleName: (v) => Parsers.string(v),
      employer: (v) => Parsers.string(v) ?? "unknown",
      inventory: (v) => Parsers.array(v, Parsers.definedString),
      state: (v) => Parsers.string(v)?.toUpperCase().substring(0, 2),
      age: (v) => Parsers.number(v),
    };
  }
}

export const getCorrectValidParams = (): DTMembers<Person> => ({
  age: 2,
  firstName: "fn",
  lastName: "ln",
  middleName: "mn",
  state: "Florida",
  inventory: ["item 1"],
});

export const errRequired = "Required";
export const errNumMax = "Must be at most 3.";
export const errStrMax = "Must be at most 3 characters long.";

export const invalidParamValidation: DTValidation<Person> = {
  age: errNumMax,
  firstName: errStrMax,
  lastName: errStrMax,
  inventory: "Must have at least one item",
  state: errRequired,
};

export const getParsedParams = () => ({
  age: 2,
  employer: "unknown",
  firstName: "fn",
  lastName: "ln",
  middleName: "mn",
  state: "FL",
  inventory: ["item 1"],
});

/** firstName missing */
export const getIncorrectParams = () => ({
  age: 2,
  employer: "e",
  lastName: "ln",
  middleName: "mn",
  state: "Florida",
  inventory: ["item 1"],
});

// ---------------------------------------------------------------------------------------------

export class EmptyablePerson extends DTClass<EmptyablePerson> {
  name!: string;
  age?: number | undefined;

  protected get parsers(): DTParsers<EmptyablePerson> {
    return {
      name: (v) => Parsers.string(v) ?? "default name",
      age: (v) => Parsers.number(v),
    };
  }
}
