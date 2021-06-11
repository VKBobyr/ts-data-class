/* eslint-disable max-classes-per-file */
export class ParsingError extends Error {
  constructor(key: string = '') {
    super(`Unable to parse ${key}`);
  }
}

export class ParsersNotFoundError extends Error {
  constructor(instance: any) {
    super(`Parsers not found. Call '${instance.constructor.name}.setParsers({...})' under the defintion`);
  }
}
