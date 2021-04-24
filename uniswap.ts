import { Token } from './token';

class Pair {
  private token0: string;
  private token1: string;

  constructor(public id: string) {
    const [zero, one] = id.split('-');
    this.token0 = zero;
    this.token1 = one;
  }

  getReserves() {
    return {
      [this.token0]: Token(this.token0).balanceOf(this.id),
      [this.token1]: Token(this.token1).balanceOf(this.id),
    };
  }

  swap(from: string, amount: number, token0: string, token1: string) {
    // (Ra - Da)(Rb + Db) = k or x * y = k
    // x and y are the reserves of each asset

    const reserveA = Token(token0).balanceOf(this.id);
    const reserveB = Token(token1).balanceOf(this.id);

    // (amount * reserveB) / reserveA;
    const swapAmount = (amount * reserveB) / reserveA;
    Token(token0).transfer(from, this.id, amount);
    Token(token1).transfer(this.id, from, swapAmount);
  }
}

export class Uniswap {
  pairs: { [x: string]: Pair } = {};

  constructor() {}

  static getPairId(token0: string, token1: string) {
    const id = `${[token0, token1].sort().join('-')}`;
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
