# TS Data-Class

This package aims to simplify and secure data parsing, manipulation, and validation in typescript by providing auto-generated constructors, helper methods, and parsing utilities with **minimal** boilerplate and full intellisence support.

Every instance of the data class will automatically have:

- A typed constructor
- `copy` & `copyDeep`
- `parse` & `tryParse`
- `validate` & `validateMember`
- `equals`

## Installation

npm: `npm install ts-data-class`

yarn: `yarn add ts-data-class`

## Usage

### Setup

1. Define a class `T` that extends `DTClass<T>`
2. Define class members, marking optional with `?:` and required with `!:`
3. Write a `parsers` constant of type `DTParsers<T>`.
   - This will define how each of the members is validated and parsed.
   - For each of the fields, define a function of type `(v: unknown) => T` or use one of the provided parsers by importing the `Parsers` object
4. (optional) Write a `validators` constant of type `DTValidators<T>`
   - This provides validation for your class fields via the `validate` method
   - For each of the fields, provide a validation function of type `(v: T) => string | undefined` where `string` is the error message and `undefined` is returned in case of a successful validation. You can also use one of the provided validators by importing the `Validators` object
5. Create a constructor that
   - Accepts `params: DTMembers<T>`
   - Calls `super({parsers})`
     - Note: If you created a `validators` variable in step 4, call `super({parsers, validators})`
   - Calls `this.assign(params)`

##### Example:

```typescript
const parsers: DTParsers<Person> = {
  state: Parsers.string({
    modifiers: [Mods.string.upper(), Mods.string.maxLen(2)],
  }),
  firstName: Parsers.defined(Parsers.string({})),
  lastName: Parsers.definedLazy(Parsers.string({}), () => "unknown"),
  middleName: Parsers.string({}),
  employer: Parsers.defined(Parsers.string({}), "unknown"),
  inventory: (v) => (Array.isArray(v) ? v : undefined),

  // equivalent of `Parsers.number({})`
  age: (v) => (typeof v === "number" ? v : undefined),
};

// optional
const validators: DTValidators<Person> = {
  state: Validators.defined(),
  firstName: Validators.strings.maxLen(3),
  lastName: Validators.strings.maxLen(3),
  middleName: null, // don't validate
  inventory: (v) =>
    v === undefined || v.length > 0 ? undefined : "Must have at least one item",
  age: Validators.defined([Validators.numbers.max(3)]),
  employer: Validators.defined(),
};

class Person extends DTClass<Person> {
  firstName!: string; // required
  lastName!: string; // required
  middleName?: string; // optional
  employer?: string; // optional
  age?: number; // optional
  state?: string; // optional
  inventory?: string[]; // optional

  // important!
  constructor(params: DTMembers<Person>) {
    super({
      parsers, // required
      validators, // optional
    });
    this.assign(params);
  }
}
```

- Most of the provided parsers also take modifiers which are applied to the field _after_ it's validated. You can use custom modifiers as long as they're of the form `(T) => T`

- As long as `strict` is set to `true` in `tsconfig.json`, typescript will provide useful errors and warnings as to which parsers are missing and whether they result in expected types

## Functionality

### Constructors

Data-classes are instantiated the same way you would instantiate any other class:

```typescript
const person = new Person({
  firstName: "bobby",
  middleName: "john",
  lastName: "jackson",
  age: 102, // will be clamped to 100 by parser
  state: "Florida", // will be clamped to len 2 and made uppercase
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
```

Typescript will suggest parameters and provide warnings if the types are wrong. Instantiating the object will also apply the parsers on each field (that we set in the constructor).

### copy

`copy` works as it would in many other data-classes, copying only the provided fields:

```typescript
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
```

It can also be used with no params to make a shallow copy.
Alternatively `deepCopy` can be used to make a deep copy.

### parse

Whereas constructors are mostly written on controlled data, `parse` can be used on `unknown` values (usually received through an api call). `parse` will validate that data is not `undefined`, extract expected parameters, and apply the parsers defined for each field.

```typescript
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
```

> If `Defined` is used with no fallback value, and the input is `undefined`, then `parse`, `copy`, and the constructor will throw a `ParsingError` when they assert that the field is defined

### tryParse

Similar to parse, but returns `undefined` if _any_ exception is thrown during parsing

```typescript
const p1 = Person.tryParse(undefined);
console.log(p1); // undefined

const p2 = Person.tryParse({}); // firstName assertion fails
console.log(p2); // undefined
```

### equal / equals

You can also check equality of two `DTClass`es:

```typescript
person.equals({ ...person }); // true

person.equals({ ...person, firstName: "rambo" }); // false
person.equals(null); // false
person.equals(undefined); // false
person.equals(false); // false
person.equals(4); // false
person.equals("43"); // false

// can also use the static version
Person.equal(person, { ...person }); // true
Person.equal(person, { ...person, firstName: "rambo" }); // false
Person.equal(undefined, undefined); // true
// etc..
```

## Validation Example

```typescript
import DTClass, { DTParams, DTParsers, Parsers, Validators } from "../src";
import { DTValidators } from "../src/data_class";

const parsers: DTParsers<Cat> = {
  name: Parsers.defined(Parsers.string({})),
  breed: Parsers.defined(Parsers.string({})),
  age: Parsers.number({}),
};

const validators: DTValidators<Cat> = {
  name: Validators.strings.maxLen(3),
  age: Validators.defined([Validators.numbers.max(3)]),
  breed: null, // dont validate this value
};

class Cat extends DTClass<Cat> {
  name!: string;
  breed!: string;
  age?: number;

  constructor(params: DTParams<Cat>) {
    super({ parsers, validators });
    this.assign(params);
  }
}

const cat = new Cat({
  breed: "Breedy McBreed",
  name: "Acer", // too long
});

// console.log(cat.validateMember('breed')); // validator not found error

console.log(cat.validateMember("name")); // Must be at most 3 characters long.
console.log(cat.validateMember("age")); // Required
console.log(cat.validate()); // { name: 'Must be at most 3 characters long.', age: 'Required' }
console.log(cat.isValid); // false

const newCat = cat.copy({ name: "Bob" });
console.log(newCat.validateMember("name")); // undefined
console.log(newCat.validateMember("age")); // Required
console.log(newCat.validate()); // { age: 'Required' }
console.log(newCat.isValid); // false

const newerCat = newCat.copy({ age: 4 });
console.log(newerCat.validateMember("age")); // Must be at most 3.
console.log(newerCat.validate()); // { age: 'Must be at most 3.' }
console.log(newerCat.isValid); // false

const newestCat = newCat.copy({ age: 3 });
console.log(newestCat.validateMember("age")); // undefined
console.log(newestCat.validate()); // undefined
console.log(newestCat.isValid); // true
```

### Nested DTClass Example

```typescript
const ownerParsers: DTParsers<Owner> = {
  name: Parsers.defined(Parsers.string({}), "unknown name"),
  age: Parsers.defined(Parsers.number({}), -1),
};

class Owner extends DTClass<Owner> {
  name!: string;
  age?: number;

  constructor(params: DTMembers<Owner>) {
    super({ parsers: ownerParsers });
    this.assign(params);
  }
}

const parsers: DTParsers<Cat> = {
  numLives: (v) => (typeof v === "number" ? v : 9),
  breed: (v) => (typeof v === "string" ? v : "stray"),
  name: (v) => (typeof v === "string" ? v : undefined),
  owner: (v) => Owner.tryParse(v) ?? Owner.empty(),
};

class Cat extends DTClass<Cat> {
  numLives!: number; // required
  breed!: string; // required
  name?: string; // optional
  owner!: Owner; // required

  constructor(params: DTMembers<Cat>) {
    super({ parsers });
    this.assign(params);
  }
}

const cat1 = new Cat({
  numLives: 8,
  name: "Whiskers",
  breed: "Bald",
  owner: new Owner({ name: "jack", age: 2 }),
});
console.log(cat1);
/**
  Cat {
    numLives: 8,
    breed: 'Bald',
    name: 'Whiskers',
    owner: Owner { name: 'jack', age: 2 }
  }
 */

const cat2 = cat1.copy({
  name: "Kitteh",
  breed: undefined,
  owner: undefined,
});
console.log(cat2);
/**
  Cat {
    numLives: 8,
    breed: 'stray',
    name: 'Kitteh',
    owner: Owner { name: 'unknown name', age: -1 }
  }
*/

const cat3 = cat2.copy({
  breed: "tiger",
  owner: cat2.owner.copy({
    name: "bobby",
  }),
});
console.log(cat3);
/**
  Cat {
    numLives: 8,
    breed: 'tiger',
    name: 'Kitteh',
    owner: Owner { name: 'bobby', age: -1 }
  }
 */
```
