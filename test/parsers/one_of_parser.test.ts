import OneOf from '../../src/parsers/one_of';

describe('OneOf', () => {
  const parser = OneOf([1, 2, 3, 5, 8]);

  test('should return the value if its in the array', () => {
    expect(parser(1)).toEqual(1);
    expect(parser(2)).toEqual(2);
    expect(parser(3)).toEqual(3);
    expect(parser(5)).toEqual(5);
    expect(parser(8)).toEqual(8);
  });

  test('should return undefined if the value is not in the array', () => {
    expect(parser('1')).toEqual(undefined);
    expect(parser('2')).toEqual(undefined);
    expect(parser('3')).toEqual(undefined);
    expect(parser('5')).toEqual(undefined);
    expect(parser('8')).toEqual(undefined);
    expect(parser(undefined)).toEqual(undefined);
  });
});
