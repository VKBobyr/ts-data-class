import DTClass, {
  DTParams, DTParsers, Parsers, Validators,
} from '../src';
import { DTValidators } from '../src/data_class';

const parsers: DTParsers<Cat> = {
  name: Parsers.defined(Parsers.string({})),
  breed: Parsers.defined(Parsers.string({})),
  age: Parsers.number({}),
};

const validators: DTValidators<Cat> = {
  name: Validators.strings.maxLen(3),
  age: Validators.defined([
    Validators.numbers.max(3),
  ]),
  breed: null, // dont validate this value
};

class Cat extends DTClass<Cat> {
  name!: string
  breed!: string
  age?: number

  constructor(params: DTParams<Cat>) {
    super(parsers, { validators });
    this.assign(params);
  }
}

const cat = new Cat({
  breed: 'Breedy McBreed',
  name: 'Acer', // too long
});

console.log(cat.validate('breed')); // validator not found error

console.log(cat.validate('name')); // Must be at most 3 characters long.
console.log(cat.validate('age')); // Required
console.log(cat.validate()); // name: Must be at most 3 characters long.
console.log(cat.isValid); // false

const newCat = cat.copy({ name: 'Bob' });
console.log(newCat.validate('name')); // undefined
console.log(newCat.validate('age')); // Required
console.log(newCat.validate()); // age: Required
console.log(newCat.isValid); // false

const newerCat = newCat.copy({ age: 4 });
console.log(newerCat.validate('age')); // Must be at most 3.
console.log(newerCat.validate()); // age: Must be at most 3.
console.log(newerCat.isValid); // false

const newestCat = newCat.copy({ age: 3 });
console.log(newestCat.validate('age')); // undefined
console.log(newestCat.validate()); // undefined
console.log(newestCat.isValid); // true
