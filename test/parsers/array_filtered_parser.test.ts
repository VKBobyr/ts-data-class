import { expect } from 'chai';
import { describe, it } from 'mocha';
import ArrayFilteredParser from '../../src/parsers/array_filtered_parser';

describe('ArrayFilteredParser', () => {
  it('should filter items that fail the parse', () => {
    const items = [0, 1, 2, 3, 4, 5];
    const filter = ArrayFilteredParser((v) => (v > 3 ? v : undefined));
    expect(filter(items)).to.have.same.members([4, 5]);
  });
});
