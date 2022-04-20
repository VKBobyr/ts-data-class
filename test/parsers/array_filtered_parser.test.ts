import ArrayFilteredParser from '../../src/parsers/array_filtered_parser';

describe('ArrayFilteredParser', () => {
  test('should filter items that fail the parse', () => {
    const items = [0, 1, 2, 3, 4, 5];
    const filter = ArrayFilteredParser<number | undefined>((v) => {
      if (typeof v !== 'number') return undefined;
      return v < 3 ? v : undefined;
    });
    expect(filter(items)).toEqual([0, 1, 2]);
  });

  test('should return undefined if input is undefined', () => {
    const items = undefined;
    const filter = ArrayFilteredParser<number | undefined>((v) => {
      if (typeof v !== 'number') return undefined;
      return v < 3 ? v : undefined;
    });
    expect(filter(items)).toEqual(undefined);
  });
});
