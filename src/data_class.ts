import clone from 'lodash.clone';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import isUndefined from 'lodash.isundefined';
import omitBy from 'lodash.omitby';
import {
  BadParamsError, ParsersNotFoundError, ValidatorNotFoundForFieldError, ValidatorsNotFoundError,
} from './errors';
import { Parser } from './parsers/parsers';
import { FunctionNames } from './utility_types';
import { Validator } from './validators';

// eslint-disable-next-line no-unused-vars
type DTConstructor<T extends DTClass<T>> = { new(params: DTMembers<T>): T }
export type DTMembers<T = any> = Pick<T, Exclude<keyof T, keyof DTClass<any> | FunctionNames<T>>>
export type DTParams<T = any> = DTMembers<T>

export type DTParsers<T extends DTClass<T>> = {
  // eslint-disable-next-line no-unused-vars
  [K in keyof DTMembers<T>]-?: (v: unknown) => T[K]
}

export type DTValidators<T extends DTClass<T>> = {
  // eslint-disable-next-line no-unused-vars
  [K in keyof DTMembers<T>]-?: Validator<T[K]> | null
}

export type DTAdditionalConfig<T extends DTClass<T>> = {
  validators?: DTValidators<T>
}

/* eslint-disable no-unused-vars */
export default abstract class DTClass<T extends DTClass<T>> {
  static parsers: DTParsers<any>
  // static validators: DTValidators<any>

  protected get validators(): DTValidators<T> {
    // @ts-ignore
    const { validators } = this.constructor;
    if (validators === undefined) throw new ValidatorsNotFoundError(this);
    return validators;
  }

  private get validateAllFields() : string | undefined {
    return this.keys.reduce<string | undefined>((error, key) => {
      if (error !== undefined) return error;
      const validator = this.validators[key];
      if (!validator) return undefined;

      // @ts-ignore
      const validation = validator(this[key]);
      return validation ? `${key}: ${validation}` : undefined;
    }, undefined);
  }

  /**
   * Returns true if object passes all validations
   * false otherwise
   *
   * @throws ValidatorsNotFoundError if not set
   */
  get isValid(): boolean {
    return !this.validateAllFields;
  }

  /**
   * Returns validation error for the whole object if key not provided
   * Returns validation for the field if key provided
   *
   * @throws ValidatorsNotFoundError if not set
   * @throws ValidatorNotFoundForFieldError if not set for field
   */
  validate(key?: keyof DTMembers<T>): string | undefined {
    if (key === undefined) {
      return this.validateAllFields;
    }

    const validator = this.validators[key];
    // @ts-ignore
    if (!validator) throw new ValidatorNotFoundForFieldError(this, key);
    // @ts-ignore
    return validator(this[key]);
  }

  static get keys(): (keyof DTMembers)[] {
    // @ts-ignore
    return Object.keys(this.parsers);
  }

  protected get parsers(): DTParsers<T> {
    // @ts-ignore
    return this.constructor.parsers;
  }

  private get keys(): (keyof DTMembers<T>)[] {
    // @ts-ignore
    return this.constructor.keys;
  }

  private instantiate(args: DTMembers<T>): T {
    const Constructor: T = Object(this).constructor;
    // @ts-ignore
    return new Constructor(args);
  }

  constructor(parsers: DTParsers<T>, params?: DTAdditionalConfig<T>) {
    // @ts-ignore
    this.constructor.parsers = parsers;

    if (params) {
      // @ts-ignore
      this.constructor.validators = params.validators;
    }
  }

  /**
   * Called only in the constructor; assigns parameters in the class
   *
   * @param params - params to assign
   */
  protected assign(params: DTMembers<T>) {
    // @ts-ignore
    if (this.parsers === undefined) throw new ParsersNotFoundError(this);

    DTClass.assertIsObject(params);
    // @ts-ignore
    Object.assign(this, DTClass.parseParams({}, params, this.constructor.parsers));
    Object.freeze(this);
  }

  /**
   * Copies the current instance, replacing specified parameters.
   * Parsers are applied to the passed in fields with behavior
   * identical to the constructor
   *
   * @param params - params with which to try to copy the instance
   * @returns an instance of T
   */
  copy(params?: Partial<DTMembers<T>>): T {
    // @ts-ignore
    if (params === undefined) return clone(this);

    DTClass.assertIsObject(params);
    // @ts-ignore
    return this.instantiate({ ...this, ...params });
  }

  /**
   * Deep-copies the current instance, replacing specified parameters.
   * Parsers are applied to the passed in fields with behavior
   * identical to the constructor
   *
   * @param params - params with which to try to copy the instance
   * @returns an instance of T
   */
  deepCopy(params?: Partial<DTMembers<T>>): T {
    // @ts-ignore
    if (params === undefined) return cloneDeep(this);

    DTClass.assertIsObject(params);
    // @ts-ignore
    return this.instantiate({ ...cloneDeep(this), ...params });
  }

  private static assertIsObject(params: unknown) {
    if (typeof params === 'object' && !!params) return;
    throw new BadParamsError(params);
  }

  /**
   * Parses params of any type. Usually used on uncontrolled data or API calls.
   *
   * @param params - params with which to try to create a class
   * @throws `BadParamsError` if params are not an object
   * @throws `KeyParsingError` if fails to parse a key
   * @returns an instance of T
   */
  static parse<F extends DTClass<F>>(this: DTConstructor<F>, params: any) : F {
    DTClass.assertIsObject(params);
    return new this(params);
  }

  /**
   * Creates an instance from an empty constructor.
   * May throw a parsing error if no default is provided for a required field
   */
  static empty<F extends DTClass<F>>(
    this: DTConstructor<F>,
    params?: Partial<DTMembers<F>>,
  ): F {
    // @ts-ignore
    return new this(params ?? {});
  }

  /**
   * Parses params of any type. Usually used on uncontrolled data or API calls.
   * If an exception is thrown during parsing, returns undefined.
   *
   * @param params - params with which to try to create a class
   * @returns an instance of T | undefined
   */
  static tryParse<F extends DTClass<F>>(this: DTConstructor<F>, params: any) : F | undefined {
    try {
      return new this(params);
    } catch {
      return undefined;
    }
  }

  /**
   * tryParse alternative with intellisense
   *
   * @param params - params with which to try to create a class
   * @returns an instance of T | undefined
   */
  static tryCreate<F extends DTClass<F>>(
    this: DTConstructor<F>, params: DTParams<F>,
  ): F | undefined {
    // @ts-ignore
    return this.tryParse<F>(params);
  }

  /**
   * Checks whether this DTClass is equal to any other object.
   * Expects another DTClass, but safe to use any other type of object.
   * If an exception is thrown during evaluation, returns false.
   */
  equals(dc: DTMembers<T> | undefined) : boolean {
    // @ts-ignore
    return this.constructor.equal(this, dc);
  }

  /**
   * Checks whether two DTClasses are equal.
   * Expects two DTClasses, but safe to use any other type of object.
   * If an exception is thrown during evaluation, returns false.
   */
  static equal<F extends DTMembers<F>>(dc1: F | undefined, dc2: F | undefined): boolean {
    const m1 = omitBy({ ...dc1 }, isUndefined);
    const m2 = omitBy({ ...dc2 }, isUndefined);
    return isEqual(m1, m2);
  }

  protected static parseParams<P extends DTClass<P>>(
    current: Partial<DTMembers<P>>,
    params: Record<string, unknown>,
    parsers: DTParsers<P>,
  ): DTMembers<P> {
    // @ts-ignore
    const out: DTMembers<P> = {};
    Object.keys(parsers).forEach((key) => {
      // @ts-ignore
      const parser: Parser<T> = parsers[key];
      if (parser === undefined) return;

      const pValue = params[key];
      // @ts-ignore
      const cValue = current[key];

      if (pValue === undefined) {
        if (cValue === undefined) {
          // @ts-ignore
          out[key] = parser(undefined, key);
        } else {
          // @ts-ignore
          out[key] = cValue;
        }
      } else if (pValue !== cValue) {
        // @ts-ignore
        out[key] = parser(pValue, key);
      }
    });

    return out;
  }
}
