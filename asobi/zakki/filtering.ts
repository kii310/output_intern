// filterの条件を一つにまとめる
type Expr<E> = (data: E) => boolean;
type Recursive<R> = {
  composite: (expr: Expr<R>) => Recursive<R>,
  exec: () => R[],
  identity: () => R[]
};
export const filtering = <T>(data: T[]): Recursive<T> => {
  let expr_funcs: Expr<T>[] = [];
  const recursive: Recursive<T> = {
    composite: (expr: Expr<T>) => {
      expr_funcs.push(expr);
      return recursive;
    },
    exec: () => data.filter(
      item => expr_funcs.every(expr => expr(item))
    ),
    identity: () => data,
  };
  return recursive;
};

// example
const result = filtering([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  .composite(item => item % 2 === 0)
  .composite(item => item % 5 === 0)
  .exec();
console.log(result); // [1, 3, 7]
