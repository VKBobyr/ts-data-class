import { expect } from 'chai';
import { describe, it } from 'mocha';
import { validators } from '../src';

describe('validators', () => {
  describe('nonNullable', () => {
    const message = 'Required';
    const validator = validators.nonNullable();

    const customMessage = 'ERR';
    const customValidator = validators.nonNullable(customMessage);

    it('should return an error for a null or undefined value', () => {
      expect(validator(null)).to.eq(message);
      expect(validator(undefined)).to.eq(message);
    });

    it('should set custom value', () => {
      expect(customValidator(null)).to.eq(customMessage);
      expect(customValidator(undefined)).to.eq(customMessage);
    });

    it('should return undefined on a non-null value', () => {
      expect(customValidator(0)).to.eq(undefined);
      expect(customValidator(false)).to.eq(undefined);
      expect(customValidator(42)).to.eq(undefined);
      expect(customValidator('hello')).to.eq(undefined);
    });
  });

  describe('stringMinLen', () => {
    const validator = validators.stringMinLen(4);

    it('should return an error for short message', () => {
      expect(validator('abc')).to.not.eq(undefined);
      expect(validator('ab')).to.not.eq(undefined);
      expect(validator('a')).to.not.eq(undefined);
      expect(validator('')).to.not.eq(undefined);
    });

    it('should not return an error for long enough message', () => {
      expect(validator('abcd')).to.eq(undefined);
      expect(validator('abcde')).to.eq(undefined);
      expect(validator('abcdef')).to.eq(undefined);
      expect(validator('abcdefg')).to.eq(undefined);
    });
  });

  describe('stringMaxLen', () => {
    const validator = validators.stringMaxLen(4);

    it('should return an error for messages that are too long', () => {
      expect(validator('abcde')).to.not.eq(undefined);
      expect(validator('abcdef')).to.not.eq(undefined);
      expect(validator('abcdefg')).to.not.eq(undefined);
    });

    it('should not return an error for short enough messages', () => {
      expect(validator('abcd')).to.eq(undefined);
      expect(validator('abc')).to.eq(undefined);
      expect(validator('ab')).to.eq(undefined);
      expect(validator('a')).to.eq(undefined);
      expect(validator('')).to.eq(undefined);
    });
  });

  describe('multi', () => {
    const validator = validators.multi([
      validators.stringMinLen(3),
      validators.stringMaxLen(5),
    ]);

    it('should return an error for messages in the wrong range', () => {
      expect(validator('')).to.include('at least 3');
      expect(validator('a')).to.include('at least 3');
      expect(validator('ab')).to.include('at least 3');
      expect(validator('abcdef')).to.include('at most 5');
      expect(validator('abcdefg')).to.include('at most 5');
    });

    it('should not return an error in the right range', () => {
      expect(validator('abcde')).to.eq(undefined);
      expect(validator('abcd')).to.eq(undefined);
      expect(validator('abc')).to.eq(undefined);
    });
  });
});
