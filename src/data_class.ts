import { ParsersNotFoundError } from './errors';
import { Parser } from './parsers/parsers';
import { SmartParams } from './utility_types';

// eslint-disable-next-line no-unused-vars
type DClassConstructor<T extends DClass<T>> = { new(params: DClassParams<T>): T }
type DClassMembers<T extends DClass<T>> = Pick<T, Exclude<keyof T, keyof DClass<T>>>
type DClassParams<T extends DClass<T>> = SmartParams<DClassMembers<T>>

export type DClassParsers<T extends DClass<T>> = {
  // eslint-disable-next-line no-unused-vars
  [K in keyof DClassMembers<T>]-?: (v: unknown) => T[K]
}

/* eslint-disable no-unused-vars */
export default abstract class DClass<T extends DClass<T>> {
  static parsers: DClassParsers<any>

  private instantiate(args: DClassParams<T>): T {
    const Constructor: T = Object(this).constructor;
    // @ts-ignore
    return new Constructor(args);
  }

  constructor(params: DClassParams<T>) {
    // @ts-ignore
    if (this.constructor.parsers === undefined) throw new ParsersNotFoundError(this);

    // @ts-ignore
    Object.assign(this, DClass.parseParams({}, params, this.constructor.parsers));
    Object.freeze(this);
  }

  copyWith(params: Partial<DClassMembers<T>>): T {
    // @ts-ignore
    return this.instantiate({ ...this, ...params });
  }

  static parse<F extends DClass<F>>(this: DClassConstructor<F>, params: any) {
    return new this(params);
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

  static setParsers<F extends DClass<F>>(this: DClassConstructor<F>, parsers: DClassParsers<F>) {
    Object.getPrototypeOf(this).parsers = parsers;
  }
}
