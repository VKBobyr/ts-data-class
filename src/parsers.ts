import DTErrors from "./errors";

export abstract class Parsers {
  static defined<T>(v: T | undefined) {
    if (v === undefined) throw DTErrors.ExpectedDefined;
    return v;
  }

  static makeParserDefined<P extends any[], R>(
    parser: (...params: P) => R | undefined
  ) {
    return function strictParser(...v: P): R {
      return Parsers.defined(parser(...v));
    };
  }

  static string(v: unknown): string | undefined {
    if (typeof v === "string") return v;
    return undefined;
  }

  static definedString = Parsers.makeParserDefined(Parsers.string);

  private static round(num: number, decimals: number) {
    const scale = Math.pow(10, decimals);
    return Math.round((num + Number.EPSILON) * scale) / scale;
  }

  static number(
    v: unknown,
    params?: { min?: number; max?: number; roundTo?: number }
  ): number | undefined {
    if (typeof v !== "number") return undefined;
    let _v: number = v;
    if (params?.min) _v = Math.max(_v, params.min);
    if (params?.max) _v = Math.min(_v, params.max);
    if (params?.roundTo !== undefined) _v = Parsers.round(_v, params.roundTo);
    return _v;
  }

  static definedNumber = Parsers.makeParserDefined(Parsers.number);

  static boolean(
    v: unknown,
    params?: { min?: boolean; max?: boolean }
  ): boolean | undefined {
    if (typeof v !== "boolean") return undefined;
    return v;
  }

  static definedBoolean = Parsers.makeParserDefined(Parsers.boolean);

  static array<T = unknown>(
    v: unknown,
    parser: (e: unknown) => T
  ): T[] | undefined {
    if (Array.isArray(v)) return v.map((e) => parser(e));
    return undefined;
  }

  static definedArray = Parsers.makeParserDefined(Parsers.array);
}
