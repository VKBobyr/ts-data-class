/* eslint-disable no-unused-vars */
export type Validator<T> = (v: T) => string | undefined

export function multi<T>(validators: Validator<T>[]): Validator<T> {
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

function defined<T>(
  nonNullValidators?: Validator<NonNullable<T>>[],
  customMessage?: string,
): Validator<T | undefined> {
  return multi<T | undefined>([
    ValidatorGenerator(
      (v) => v === undefined || v === null,
      'Required',
      customMessage,
    ),

    // @ts-ignore
    ...(nonNullValidators ?? []),
  ]);
}

const Validators = {
  defined,
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
    required: ConfigurableValidatorGenerator<void, string>(
      (_, v) => v.length === 0,
      () => 'Required.',
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
