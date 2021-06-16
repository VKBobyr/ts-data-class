/* eslint-disable no-unused-vars */
export type Validator<T> = (v: T) => string | undefined

export function multi<T>(validators: Validator<T>[]) : Validator<T> {
  return (v: T) => validators
    .reduce<string | undefined>(
      (err, validator) => err ?? validator(v),
      undefined,
    );
}

export function ValidatorGenerator<T>(
  isValid: (v: T) => boolean,
  message: string, customMessage?: string,
): Validator<T> {
  return (v) => (
    isValid(v)
      ? (customMessage ?? message)
      : undefined
  );
}

const nonNullable = (customMessage?: string) => ValidatorGenerator(
  (v) => v === undefined || v === null,
  'Required',
  customMessage,
);

const stringMinLen = (len: number, cMessage?: string) => ValidatorGenerator<string>(
  (v) => v.length < len,
  `Must be at least ${len} characters long`,
  cMessage,
);

const stringMaxLen = (len: number, cMessage?: string) => ValidatorGenerator<string>(
  (v) => v.length > len,
  `Must be at most ${len} characters long`,
  cMessage,
);

const validators = {
  nonNullable,
  stringMinLen,
  stringMaxLen,
  multi,
};

export default validators;
