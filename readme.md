# TS Data-Class
[![codecov](https://codecov.io/gh/VKBobyr/ts-data-class/branch/master/graph/badge.svg?token=6YSAOL8LZT)](https://codecov.io/gh/VKBobyr/ts-data-class)

This package aims to simplify and secure data parsing and manipulation in typescript by providing auto-generated constructors, helper methods, and parsing utilities with **minimal** boilerplate and full intellisense support.

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

1. Define a class `T` that extends `DTClass<T>`
2. Define class members, marking optional with `?:` and required with `!:`
3. Define the `parsers` getter with a parser for each of the fields (full intellisense support)
4. Use the class as you would any other but with all the data class perks and full intellisense support!

##### Example:

```typescript
class Owner extends DTClass<Owner> {
  name!: string;
  age?: number;

  protected get parsers(): DTParsers<Owner> {
    return {
      name: (v) => Parsers.string(v) ?? "unknown name",
      age: (v) => Parsers.number(v) ?? -1,
    };
  }
}

class Cat extends DTClass<Cat> {
  numLives!: number; // required
  breed!: string; // required
  name?: string; // optional
  owner!: Owner; // required

  protected get parsers(): DTParsers<Cat> {
    return {
      numLives: (v) => (typeof v === "number" ? v : 9),
      breed: (v) => (typeof v === "string" ? v : "stray"),
      name: (v) => (typeof v === "string" ? v : undefined),
      owner: (v) => Owner.tryParse(v) ?? Owner.empty(),
    };
  } // required
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
