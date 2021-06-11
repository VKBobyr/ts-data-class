// eslint-disable-next-line max-len
export type KeysThatContain<T, U> = { [P in keyof T]: U extends Extract<T[P], U> ? P : never }[keyof T];
export type WhichContain<T, U> = { [K in KeysThatContain<T, U>]: T[K] }

// eslint-disable-next-line max-len
export type KeysThatDontContain<T, U> = { [P in keyof T]: U extends Extract<T[P], U> ? never : P }[keyof T];
export type WhichDontContain<T, U> = { [K in KeysThatDontContain<T, U>]: T[K] }

export type SmartParams<T> = WhichDontContain<T, undefined> & Partial<WhichContain<T, undefined>>

// eslint-disable-next-line no-unused-vars
export type Converter<F, T> = (v: F) => T
export type Modifier<T> = Converter<T, T>
