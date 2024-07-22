const nand = (A: boolean) => (B: boolean) => !(A && B);

const not = (A: boolean) => nand(A)(A);

const and = (A: boolean) => (B: boolean) => not(nand(A)(B));

const or = (A: boolean) => (B: boolean) => nand(not(A))(not(B));

const nor = (A: boolean) => (B: boolean) => not(or(A)(B));

const xor = (A: boolean) => (B: boolean) => nor(and(A)(B))(nor(A)(B));

/*
 * A  B  !A !B  A*B A+B  !(A*B)  !A+!B  !(A+B)  !A*!B  A⊕B
 * 1  1   0  0    1   1       0      0       0      0    0
 * 1  0   0  1    0   1       1      1       0      0    1
 * 0  1   1  0    0   1       1      1       0      0    1
 * 0  0   1  1    0   0       1      1       1      1    0
 *
 * De Morgan's law
 * !(A * B) = !A + !B
 * !(A + B) = !A * !B
 *
 * !!A = A
 *   A = A * A
 *
 * NAND = !(A * B)
 * AND = A * B
 * OR = A + B
 * NOR = !(A + B)
 * XOR = !(AND + NOR)
 */

const t = true as const;
const f = false as const;
console.log('nand');
console.log('1 1', nand(t)(t));
console.log('1 0', nand(t)(f));
console.log('0 1', nand(f)(t));
console.log('0 0', nand(f)(f));

console.log('not');
console.log('1', not(t));
console.log('0', not(f));

console.log('and');
console.log('1 1', and(t)(t));
console.log('1 0', and(t)(f));
console.log('0 1', and(f)(t));
console.log('0 0', and(f)(f));

console.log('or');
console.log('1 1', or(t)(t));
console.log('1 0', or(t)(f));
console.log('0 1', or(f)(t));
console.log('0 0', or(f)(f));

console.log('nor');
console.log('1 1', nor(t)(t));
console.log('1 0', nor(t)(f));
console.log('0 1', nor(f)(t));
console.log('0 0', nor(f)(f));

console.log('xor');
console.log('1 1', xor(t)(t));
console.log('1 0', xor(t)(f));
console.log('0 1', xor(f)(t));
console.log('0 0', xor(f)(f));
