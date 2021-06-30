import { expect } from 'chai';
import { describe, it } from 'mocha';
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

    it('should return an error for a null or undefined value', () => {
      expect(emptyValidator(null))
        .to
        .eq(message);
      expect(emptyValidator(undefined))
        .to
        .eq(message);
    });

    it('should set custom value', () => {
      expect(emptyCustomValidator(null))
        .to
        .eq(customMessage);
      expect(emptyCustomValidator(undefined))
        .to
        .eq(customMessage);
    });

    it('should return undefined on a non-null value', () => {
      expect(emptyCustomValidator(0))
        .to
        .eq(undefined);
      expect(emptyCustomValidator(false))
        .to
        .eq(undefined);
      expect(emptyCustomValidator(42))
        .to
        .eq(undefined);
      expect(emptyCustomValidator('hello'))
        .to
        .eq(undefined);
    });

    it('should run non-null Validators', () => {
      expect(stringValidator(undefined))
        .to
        .include(message);

      expect(stringValidator('a'))
        .to
        .eq(undefined);
      expect(stringValidator('ab'))
        .to
        .eq(undefined);
      expect(stringValidator('abc'))
        .to
        .eq(undefined);
      expect(stringValidator('abcd'))
        .to
        .include('at most');
    });
  });

  describe('strings', () => {
    describe('minLen', () => {
      const validator = Validators.strings.minLen(4);
      it('should return an error for short message', () => {
        expect(validator('abc'))
          .to
          .not
          .eq(undefined);
        expect(validator('ab'))
          .to
          .not
          .eq(undefined);
        expect(validator('a'))
          .to
          .not
          .eq(undefined);
        expect(validator(''))
          .to
          .not
          .eq(undefined);
      });

      it('should not return an error for long enough message', () => {
        expect(validator('abcd'))
          .to
          .eq(undefined);
        expect(validator('abcde'))
          .to
          .eq(undefined);
        expect(validator('abcdef'))
          .to
          .eq(undefined);
        expect(validator('abcdefg'))
          .to
          .eq(undefined);
      });
    });

    describe('maxLen', () => {
      const validator = Validators.strings.maxLen(4);

      it('should return an error for messages that are too long', () => {
        expect(validator('abcde'))
          .to
          .not
          .eq(undefined);
        expect(validator('abcdef'))
          .to
          .not
          .eq(undefined);
        expect(validator('abcdefg'))
          .to
          .not
          .eq(undefined);
      });

      it('should not return an error for short enough messages', () => {
        expect(validator('abcd'))
          .to
          .eq(undefined);
        expect(validator('abc'))
          .to
          .eq(undefined);
        expect(validator('ab'))
          .to
          .eq(undefined);
        expect(validator('a'))
          .to
          .eq(undefined);
        expect(validator(''))
          .to
          .eq(undefined);
      });
    });

    describe('required', () => {
      const validator = Validators.strings.maxLen(4);

      it('should return an error for longer values', () => {
        expect(validator('abcde'))
          .to
          .not
          .eq(undefined);
        expect(validator('abcde'))
          .to
          .not
          .eq(undefined);
      });

      it('should return undefined for values that are shorter or eq to 4', () => {
        expect(validator('a'))
          .to
          .eq(undefined);
        expect(validator('ab'))
          .to
          .eq(undefined);
        expect(validator('abc'))
          .to
          .eq(undefined);
        expect(validator('abcd'))
          .to
          .eq(undefined);
      });
    });
  });

  describe('multi', () => {
    const validator = Validators.multi([
      Validators.strings.minLen(3),
      Validators.strings.maxLen(5),
    ]);

    it('should return an error for messages in the wrong range', () => {
      expect(validator(''))
        .to
        .include('at least 3');
      expect(validator('a'))
        .to
        .include('at least 3');
      expect(validator('ab'))
        .to
        .include('at least 3');
      expect(validator('abcdef'))
        .to
        .include('at most 5');
      expect(validator('abcdefg'))
        .to
        .include('at most 5');
    });

    it('should not return an error in the right range', () => {
      expect(validator('abcde'))
        .to
        .eq(undefined);
      expect(validator('abcd'))
        .to
        .eq(undefined);
      expect(validator('abc'))
        .to
        .eq(undefined);
    });
  });
});
