import { Token } from './token';

class Pair {
  constructor(public id: string) {}

  swap(from: string, amount: number, token0: string, token1: string) {
    // (Ra - Da)(Rb + Db) = k or x * y = k
    // x and y are the reserves of each asset

    const reserveA = Token(token0).balanceOf(this.id);
    const reserveB = Token(token1).balanceOf(this.id);

    // (5 * b) / a;
    const swapAmount = amount * reserveB * reserveA;
    Token(token0).transfer(from, this.id, swapAmount);
    Token(token1).transfer(this.id, from, swapAmount);
  }
}

export class Uniswap {
  pairs: { [x: string]: Pair } = {};

  constructor() {}

  static getPairId(token0: string, token1: string) {
    const id = `UniSwap-${[token0, token1].sort().join('-')}`;
    return id;
  }

  getPair(token0: string, token1: string) {
    const id = Uniswap.getPairId(token0, token1);
    return this.pairs[id];
  }

  addPair(token0: string, token1: string) {
    const id = Uniswap.getPairId(token0, token1);
    this.pairs[id] = new Pair(id);
    return this.pairs[id];
  }
}
