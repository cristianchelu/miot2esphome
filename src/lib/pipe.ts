// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function pipe<T>(...fns: Function[]) {
  return (initialValue: T) => {
    return fns.reduce((acc, fn) => fn(acc), initialValue);
  };
}
