/* eslint-disable max-classes-per-file */
export class ParsingError extends Error {
  constructor(key: string = '', info: string = '') {
    super(`[Parsing Error] Unable to parse the key '${key}' - ${info}`);
  }
}

export class ParsersNotFoundError extends Error {
  constructor(instance: any) {
    super(`Parsers not found. Call '${instance.constructor.name}.setParsers({...})' under the defintion`);
  }
}
