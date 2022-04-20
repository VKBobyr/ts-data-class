import { Mods, Parsers } from '../../src';

describe('StringParser', () => {
  test('working lowercase', () => {
    const parser = Parsers.string({
      modifiers: [
        Mods.string.lower(),
      ],
    });

    expect(parser('HELlo')).toEqual('hello');
    expect(parser('w O r L d')).toEqual('w o r l d');
    expect(parser('')).toEqual('');
  });

  test('working uppercase', () => {
    const parser = Parsers.string({
      modifiers: [
        Mods.string.upper(),
      ],
    });

    expect(parser('HELlo')).toEqual('HELLO');
    expect(parser('w O r L d')).toEqual('W O R L D');
    expect(parser('')).toEqual('');
  });

  test('working maxLen', () => {
    const parser = Parsers.string({
      modifiers: [
        Mods.string.maxLen(3),
      ],
    });

    expect(parser('hel')).toEqual('hel');
    expect(parser('world')).toEqual('wor');
    expect(parser('ab')).toEqual('ab');
    expect(parser('')).toEqual('');
  });
});
