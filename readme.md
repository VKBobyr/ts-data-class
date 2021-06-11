# TS Data-Class

This package aims to simplify and secure data parsing, manipulation, and validation in typescript by providing auto-generated constructors, `copyWith`,  `parse`, and parsing utilities with **minimal** boilerplate and full intellisence support.



## Installation

npm: `npm install ts-data-class`

yarn: `yarn add ts-data-class`

## Usage

### Define a Class

Define a class `T` extending `DClass<T>`:

```typescript
class Person extends DClass<Person> {
  firstName!: string // required
  lastName!: string // required
  age!: number // required
  middleName: string | undefined // optional
  employer: string | undefined // optional
  state: string | undefined // optional
}
```

Use `!:` for required parameters and ` | undefined` for optional parameters.

### Set Parsers

```typescript
Person.setParsers({
  age: Defined(
    NumberParser({
      modifiers: [
        ModNumberMinMax({ min: 0, max: 100 }),
        ModNumberRound(1),
      ],
    }),
  ),
  state: Defined(StringParser({ modifiers: [ModStringUpper(), ModStringMaxLen(2)] })),
  firstName: Defined(StringParser({})),
  lastName: Defined(StringParser({}), 'unknown'),
  middleName: StringParser({}),
  employer: Defined(StringParser({}), 'unknown'),
});
```

Parsers are of the form `(v: unknown) => T`, but the package provides a few commonly used ones like `NumberParser` , `StringParser`, and `Defined`.

Most of the provided parsers also take modifiers which are applied to the field. Modifiers are of the form `(T) => T`.

As long as `strict` is set to `true` in `tsconfig.json`, typescript will provide useful errors and warnings as to which parsers are missing and whether they result in expected types

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

Typescript will suggest parameters and provide warnings if the types are wrong. Instantiating the object will also apply the parsers on each field (defined in `Person.setParsers`).

### copyWith

`copyWith` works as it would in many other data-classes, copying only the provided fields:

```typescript
const employedPerson = person.copyWith({
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

> If `Defined` is used with no fallback value, and the input is `undefined`, then `parse`, `copyWith`, and the constructor will throw a `ParsingError` when they assert that the field is defined
