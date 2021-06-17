/* eslint-disable max-classes-per-file */
export class KeyParsingError extends Error {
  constructor(key: string = '', info: string = '') {
    super(`[Parsing Error] Unable to parse the key '${key}' - ${info}`);
  }
}

export class BadParamsError extends Error {
  constructor(params: unknown) {
    super(`Expected params to be an object -- got: '${params}' of type ${typeof params}`);
  }
}

export class ParsersNotFoundError extends Error {
  constructor(instance: any) {
    const className = instance.constructor.name;
    super(`Parsers not found for class '${className}'. Define parsers and a custom constructor for class '${className}' and call super(parsers).`);
  }
}

export class ValidatorsNotFoundError extends Error {
  constructor(instance: any) {
    const className = instance.constructor.name;
    super(`Validators not found for class '${className}'. Define a validators variable of type DTValidators<T> and pass it into super: super(parsers, {validators: myValidators}).`);
  }
}

export class ValidatorNotFoundForFieldError extends Error {
  constructor(instance: any, field: string) {
    const className = instance.constructor.name;
    super(`Validator not found for member '${field}' of '${className}' instance.`);
  }
}
