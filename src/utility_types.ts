// eslint-disable-next-line no-unused-vars
export type Converter<F, T> = (v: F) => T
export type Modifier<T> = Converter<T, T>
