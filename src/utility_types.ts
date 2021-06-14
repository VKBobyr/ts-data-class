// eslint-disable-next-line no-unused-vars
export type Converter<F, T> = (v: F) => T
export type Modifier<T> = Converter<T, T>
// eslint-disable-next-line no-unused-vars
export type Constructor<T, P=any> = { new(...v: P[]): T}

export type FunctionNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export type NonFunctionNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

// eslint-disable-next-line no-unused-vars
export type Comparator<T, F=T> = (a: T, b:F) => boolean
