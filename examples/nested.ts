import DTClass, { DTMembers, Parsers } from "../src";
import { DTParsers } from "../src/data_class";

class Owner extends DTClass<Owner> {
  name!: string; // required property
  age?: number; // optional property

  protected get parsers(): DTParsers<Owner> {
    return {
      name: (v) => Parsers.string(v) ?? "unknown name",
      age: (v) => Parsers.number(v) ?? -1,
    };
  }
}

class Cat extends DTClass<Cat> {
  numLives!: number; // required property
  breed!: string; // required property
  name?: string; // optional property
  owner!: Owner; // required property

  protected get parsers(): DTParsers<Cat> {
    return {
      numLives: (v) => Parsers.number(v) ?? 9,
      breed: (v) => Parsers.string(v) ?? "stray",
      name: (v) => Parsers.string(v),
      owner: (v) => Owner.tryParse(v) ?? Owner.empty(),
    };
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
  numLives: undefined,
  owner: cat2.owner.copy({
    name: "bobby",
  }),
});
console.log(cat3);
/**
  Cat {
    numLives: 9,
    breed: 'tiger',
    name: 'Kitteh',
    owner: Owner { name: 'bobby', age: -1 }
  }
 */
