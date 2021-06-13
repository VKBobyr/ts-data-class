import { BadParamsError, ParsersNotFoundError } from './errors';
import { Parser } from './parsers/parsers';

// eslint-disable-next-line no-unused-vars
type DClassConstructor<T extends DClass<T>> = { new(params: DClassMembers<T>): T }
export type DClassMembers<T extends DClass<T>> = Pick<T, Exclude<keyof T, keyof DClass<T>>>

export type DClassParsers<T extends DClass<T>> = {
  // eslint-disable-next-line no-unused-vars
  [K in keyof DClassMembers<T>]-?: (v: unknown) => T[K]
}

/* eslint-disable no-unused-vars */
export default abstract class DClass<T extends DClass<T>> {
  static parsers: DClassParsers<any>

  private instantiate(args: DClassMembers<T>): T {
    const Constructor: T = Object(this).constructor;
    // @ts-ignore
    return new Constructor(args);
  }

  constructor(parsers: DClassParsers<T>) {
    // @ts-ignore
    this.constructor.parsers = parsers;
  }

  /**
   * Called only in the constructor; assigns parameters in the class
   *
   * @param params - params to assign
   */
  protected assign(params: DClassMembers<T>) {
    // @ts-ignore
    if (this.constructor.parsers === undefined) throw new ParsersNotFoundError(this);

    DClass.assertIsObject(params);
    // @ts-ignore
    Object.assign(this, DClass.parseParams({}, params, this.constructor.parsers));
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
  copyWith(params: Partial<DClassMembers<T>>): T {
    DClass.assertIsObject(params);
    // @ts-ignore
    return this.instantiate({ ...this, ...params });
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
  static parse<F extends DClass<F>>(this: DClassConstructor<F>, params: any) : F {
    DClass.assertIsObject(params);
    return new this(params);
  }

  /**
   * Parses params of any type. Usually used on uncontrolled data or API calls.
   * If an exception is thrown during parsing, returns undefined.
   *
   * @param params - params with which to try to create a class
   * @returns an instance of T | undefined
   */
  static tryParse<F extends DClass<F>>(this: DClassConstructor<F>, params: any) : F | undefined {
    try {
      return new this(params);
    } catch {
      return undefined;
    }
  }

  protected static parseParams<P extends DClass<P>>(
    current: Partial<DClassMembers<P>>,
    params: Record<string, unknown>,
    parsers: DClassParsers<P>,
  ): DClassMembers<P> {
    // @ts-ignore
    const out: DClassMembers<P> = {};
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
