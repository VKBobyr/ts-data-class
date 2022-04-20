import { Parsers } from '../../src';
import { Parser } from '../../src/parsers/parsers';

describe('BoolParser', () => {
  let parser: Parser<boolean>;

  beforeEach(() => {
    parser = Parsers.bool();
  });

  test('should parse string false to false', () => {
    expect(parser('false')).toEqual(false);
  });

  test('should parse string true to true', () => {
    expect(parser('true')).toEqual(true);
  });

  test('should parse any other string to undefined', () => {
    expect(parser('a')).toEqual(undefined);
    expect(parser('1')).toEqual(undefined);
    expect(parser('t')).toEqual(undefined);
    expect(parser('True')).toEqual(undefined);
    expect(parser('False')).toEqual(undefined);
  });

  test('should pass booleans', () => {
    expect(parser(true)).toEqual(true);
    expect(parser(false)).toEqual(false);
  });
});
