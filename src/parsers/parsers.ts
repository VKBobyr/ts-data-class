// eslint-disable-next-line no-unused-vars
export type Parser<T> = (v: unknown, fieldName?:string) => T
// eslint-disable-next-line no-unused-vars
export type ConfigParser<T, C> = (config: C) => Parser<T>