/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import DClass, { DClassMembers, DClassParsers } from '../src';

const parsers: DClassParsers<Cat> = {
  numLives: (v) => (typeof v === 'number' ? v : 9),
  breed: (v) => ((typeof v === 'string') ? v : 'stray'),
  name: (v) => (typeof v === 'string' ? v : undefined),
  owner: (v) => (typeof v === 'string' ? v : undefined),
};

class Cat extends DClass<Cat> {
  numLives!: number // required
  breed!: string // required
  name?: string // optional
  owner?: string; // optional

  constructor(params: DClassMembers<Cat>) {
    super(parsers);
    this.assign(params);
  }
}

const cat1 = new Cat({ numLives: 8, name: 'Whiskers', breed: 'Bald' });
console.log(cat1);
// Cat { numLives: 8, breed: 'Bald', name: 'Whiskers', owner: undefined }

const cat2 = cat1.copyWith({ name: 'Kitteh', breed: undefined, owner: 'Brad' });
console.log(cat2);
// Cat { numLives: 8, breed: 'stray', name: 'Kitteh', owner: 'Brad' }

const cat3 = cat2.copyWith();
