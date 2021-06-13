# TS Data-Class

This package aims to simplify and secure data parsing, manipulation, and validation in typescript by providing auto-generated constructors, helper methods, and parsing utilities with **minimal** boilerplate and full intellisence support.

Every instance of the data class will automatically have:

- A typed constructor
- `copy` & `copyDeep`
- `parse` & `tryParse`
- `equals`

## Installation

npm: `npm install ts-data-class`

yarn: `yarn add ts-data-class`

## Usage

### Setup

1. Define a class `T` that extends `DClass<T>`
2. Define class members, marking optional with `?:` and required with `!:`
3. Write a `parsers` constant of type `DClassParsers<T>`. 
   - This will define how each of the members is validated and parsed. 
   - For each of the fields, define a function of type `(v: unknown) => T` or use one of the provided parsers like `Defined`, `NumberParser`, or `StringParser`
4. Create a constructor that 
   - Accepts `params: DClassMembers<T>`
   - Calls `super(parsers)`
   - Calls `this.assign(params)`
##### Example:

```typescript
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
  firstName!: string // required
  lastName!: string // required
  age!: number // required
  middleName?: string // optional
  employer?: string // optional
  state?: string; // optional

  // important!
  constructor(params: DClassMembers<Person>) {
    super(parsers); // sets parsers for the Person class
    this.assign(params); // used to parse & set params 
  }
}
```

- Most of the provided parsers also take modifiers which are applied to the field *after* it's validated. You can use custom modifiers as long as they're of the form `(T) => T`

- As long as `strict` is set to `true` in `tsconfig.json`, typescript will provide useful errors and warnings as to which parsers are missing and whether they result in expected types

## Functionality

### Constructors

Data-classes are instantiated the same way you would instantiate any other class:

```typescript
const person = new Person({
  firstName: 'bobby',
  middleName: 'john',
  lastName: 'jackson',
  age: 102, // will be clamped to 100 by parser
  state: 'Florida', // will be clamped to len 2 and made uppercase
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
  employer: 'self',
  lastName: undefined,
  state: 'Alaska',
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
  firstName: 'larry',
  middleName: 'j',
  lastName: 'johnson',
  randomField: 'this field should be ignored',
  age: 42,
  state: 'Massachusetts',
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

Similar to parse, but returns `undefined` if *any* exception is thrown during parsing

```typescript
const p1 = Person.tryParse(undefined);
console.log(p1); // undefined

const p2 = Person.tryParse({}); // firstName assertion fails
console.log(p2); // undefined
```

### equal / equals

You can also check equality of two `DClass`es:

```typescript
person.equals({...person}) // true

person.equals({...person, "firstName": "rambo"}) // false
person.equals(null) // false
person.equals(undefined) // false
person.equals(false) // false
person.equals(4) // false
person.equals('43'); // false

// can also use the static version
Person.equal(person, { ...person }); // true
Person.equal(person, { ...person, "firstName": "rambo" }); // false
Person.equal(undefined, undefined); // true
// etc..
```
