import { Mods, Parsers } from '../../src';
import { Parser } from '../../src/parsers/parsers';

describe('NumberParser', () => {
  describe('min-max', () => {
    describe('min by itself', () => {
      let parser: Parser<number>;

      beforeEach(() => {
        parser = Parsers.number({
          modifiers: [
            Mods.number.minMax({ min: 5 }),
          ],
        });
      });

      test('passes through when greater', () => {
        const out = parser(10);
        expect(out).toEqual(10);
      });

      test('clamps when its lower', () => {
        const out = parser(4);
        expect(out).toEqual(5);
      });

      test('nothing changes when its equal', () => {
        const out = parser(5);
        expect(out).toEqual(5);
      });
    });

    describe('max by itself', () => {
      let parser: Parser<number>;

      beforeEach(() => {
        parser = Parsers.number({
          modifiers: [
            Mods.number.minMax({ max: 5 }),
          ],
        });
      });

      test('passes through when less', () => {
        const out = parser(4);
        expect(out).toEqual(4);
      });

      test('clamps when higher', () => {
        const out = parser(6);
        expect(out).toEqual(5);
      });

      test('nothing changes when its equal', () => {
        const out = parser(5);
        expect(out).toEqual(5);
      });
    });

    describe('min-max-together', () => {
      let parser: Parser<number>;

      beforeEach(() => {
        parser = Parsers.number({
          modifiers: [
            Mods.number.minMax({ min: 1, max: 5 }),
          ],
        });
      });

      test('passes through when between', () => {
        const out = parser(4);
        expect(out).toEqual(4);
      });

      test('clamps when higher', () => {
        const out = parser(6);
        expect(out).toEqual(5);
      });

      test('clamps changes when lower', () => {
        const out = parser(0.5);
        expect(out).toEqual(1);
      });
    });
  });

  describe('round', () => {
    test('correctly round to specified number of decimals', () => {
      const parser = Parsers.number({
        modifiers: [
          Mods.number.round(2),
        ],
      });

      expect(parser(0.509)).toBe(0.51);
      expect(parser(0.501)).toBe(0.50);
      expect(parser(0.500)).toBe(0.50);
    });

    test('correctly round to integer when decimals are 0 ', () => {
      const parser = Parsers.number({
        modifiers: [
          Mods.number.round(0),
        ],
      });

      expect(parser(0.51)).toBe(1);
      expect(parser(0.49)).toBe(0);
    });

    test('should round up when in the middle', () => {
      const parser = Parsers.number({
        modifiers: [
          Mods.number.round(0),
        ],
      });

      expect(parser(0.5)).toBe(1);
    });

    test('should return the number if the decimals are less than 0', () => {
      const parser = Parsers.number({
        modifiers: [
          Mods.number.round(-1),
        ],
      });

      expect(parser(0.5)).toBe(0.5);
    });
  });
});
