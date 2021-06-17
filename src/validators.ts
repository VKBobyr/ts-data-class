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
  message: string,
  customMessage?: string,
): Validator<T> {
  return (v) => (
    isValid(v)
      ? (customMessage ?? message)
      : undefined
  );
}

function ConfigurableValidatorGenerator<C, T>(
  condition: (c: C, v: T) => boolean,
  message: (c: C) => string,
) {
  return (config: C, customMessage?: string) => {
    return ValidatorGenerator<T>(
      (v) => condition(config, v),
      message(config),
      customMessage,
    );
  };
}

function nonNullable<T>(nonNullValidators?: Validator<T>[], customMessage?: string) {
  return multi([
    ValidatorGenerator(
      (v) => v === undefined || v === null,
      'Required',
      customMessage,
    ),
    ...(nonNullValidators ?? []),
  ]);
}

const Validators = {
  nonNullable,
  multi,
  strings: {
    minLen: ConfigurableValidatorGenerator<number, string>(
      (min, v) => v.length < min,
      (min) => `Must be at least ${min} characters long.`,
    ),
    maxLen: ConfigurableValidatorGenerator<number, string>(
      (max, v) => v.length > max,
      (max) => `Must be at most ${max} characters long.`,
    ),
  },
  numbers: {
    min: ConfigurableValidatorGenerator<number, number>(
      (min, v) => v < min,
      (min) => `Must be at least ${min}.`,
    ),
    max: ConfigurableValidatorGenerator<number, number>(
      (max, v) => v > max,
      (max) => `Must be at most ${max}.`,
    ),
  },
};

export default Validators;
