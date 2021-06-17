/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import DTClass, {
  DTMembers, DTParsers, Parsers,
} from '../src';

const ownerParsers: DTParsers<Owner> = {
  name: Parsers.defined(Parsers.string({}), 'unknown name'),
  age: Parsers.defined(Parsers.number({}), -1),
};

class Owner extends DTClass<Owner> {
  name!: string
  age?: number

  constructor(params: DTMembers<Owner>) {
    super(ownerParsers);
    this.assign(params);
  }
}

const parsers: DTParsers<Cat> = {
  numLives: (v) => (typeof v === 'number' ? v : 9),
  breed: (v) => ((typeof v === 'string') ? v : 'stray'),
  name: (v) => (typeof v === 'string' ? v : undefined),
  owner: Parsers.parseOrEmpty(Owner),
};

class Cat extends DTClass<Cat> {
  numLives!: number // required
  breed!: string // required
  name?: string // optional
  owner!: Owner; // required

  constructor(params: DTMembers<Cat>) {
    super(parsers);
    this.assign(params);
  }
}

const cat1 = new Cat({
  numLives: 8,
  name: 'Whiskers',
  breed: 'Bald',
  owner: new Owner({ name: 'jack', age: 2 }),
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
  name: 'Kitteh',
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

const cat3 = cat2.copy();
