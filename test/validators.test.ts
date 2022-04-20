import { Validators } from '../src';

describe('Validators', () => {
  describe('nonNullable', () => {
    const message = 'Required';
    const emptyValidator = Validators.defined();

    const customMessage = 'ERR';
    const emptyCustomValidator = Validators.defined([], customMessage);

    const stringValidator = Validators.defined(
      [Validators.strings.maxLen(3)],
    );

    test('should return an error for a null or undefined value', () => {
      expect(emptyValidator(null))
        .toEqual(message);
      expect(emptyValidator(undefined))
        .toEqual(message);
    });

    test('should set custom value', () => {
      expect(emptyCustomValidator(null))
        .toEqual(customMessage);
      expect(emptyCustomValidator(undefined))
        .toEqual(customMessage);
    });

    test('should return undefined on a non-null value', () => {
      expect(emptyCustomValidator(0))
        .toEqual(undefined);
      expect(emptyCustomValidator(false))
        .toEqual(undefined);
      expect(emptyCustomValidator(42))
        .toEqual(undefined);
      expect(emptyCustomValidator('hello'))
        .toEqual(undefined);
    });

    test('should run non-null Validators', () => {
      expect(stringValidator(undefined))
        .toContain(message);

      expect(stringValidator('a'))
        .toEqual(undefined);
      expect(stringValidator('ab'))
        .toEqual(undefined);
      expect(stringValidator('abc'))
        .toEqual(undefined);
      expect(stringValidator('abcd'))
        .toContain('at most');
    });
  });

  describe('strings', () => {
    describe('minLen', () => {
      const validator = Validators.strings.minLen(4);
      test('should return an error for short message', () => {
        expect(validator('abc'))
          .not.toEqual(undefined);
        expect(validator('ab'))
          .not.toEqual(undefined);
        expect(validator('a'))
          .not.toEqual(undefined);
        expect(validator(''))
          .not.toEqual(undefined);
      });

      test('should not return an error for long enough message', () => {
        expect(validator('abcd'))
          .toEqual(undefined);
        expect(validator('abcde'))
          .toEqual(undefined);
        expect(validator('abcdef'))
          .toEqual(undefined);
        expect(validator('abcdefg'))
          .toEqual(undefined);
      });
    });

    describe('maxLen', () => {
      const validator = Validators.strings.maxLen(4);

      test('should return an error for messages that are too long', () => {
        expect(validator('abcde'))
          .not.toEqual(undefined);
        expect(validator('abcdef'))
          .not.toEqual(undefined);
        expect(validator('abcdefg'))
          .not.toEqual(undefined);
      });

      test('should not return an error for short enough messages', () => {
        expect(validator('abcd'))
          .toEqual(undefined);
        expect(validator('abc'))
          .toEqual(undefined);
        expect(validator('ab'))
          .toEqual(undefined);
        expect(validator('a'))
          .toEqual(undefined);
        expect(validator(''))
          .toEqual(undefined);
      });
    });

    describe('required', () => {
      const validator = Validators.strings.required();

      test('should return undefined for non-empty strings', () => {
        expect(validator('abcde'))
          .toEqual(undefined);
        expect(validator('abcde'))
          .toEqual(undefined);
      });

      test('should return an error for empty strings', () => {
        expect(validator(''))
          .not.toEqual(undefined);
      });
    });
  });

  describe('multi', () => {
    const validator = Validators.multi([
      Validators.strings.minLen(3),
      Validators.strings.maxLen(5),
    ]);

    test('should return an error for messages in the wrong range', () => {
      expect(validator(''))
        .toContain('at least 3');
      expect(validator('a'))
        .toContain('at least 3');
      expect(validator('ab'))
        .toContain('at least 3');
      expect(validator('abcdef'))
        .toContain('at most 5');
      expect(validator('abcdefg'))
        .toContain('at most 5');
    });

    test('should not return an error in the right range', () => {
      expect(validator('abcde'))
        .toEqual(undefined);
      expect(validator('abcd'))
        .toEqual(undefined);
      expect(validator('abc'))
        .toEqual(undefined);
    });
  });
});
