import { Token, kAPPL, kGOOG, kTSLA, cUSD } from './token';
import { Uniswap } from './uniswap';

export class User {
  constructor(public name: string) {}

  addLiquidity(
    token0: string,
    amount0: number,
    token1: string,
    amount1: number
  ) {
    const pairAddress = Uniswap.getPairId(token0, token1);
    Token(token0).transfer(this.name, pairAddress, amount0);
    Token(token1).transfer(this.name, pairAddress, amount1);
  }

  getBalances() {
    return {
      [cUSD]: Token(cUSD).balanceOf(this.name),
      [kAPPL]: Token(kAPPL).balanceOf(this.name),
      [kGOOG]: Token(kGOOG).balanceOf(this.name),
      [kTSLA]: Token(kTSLA).balanceOf(this.name),
    };
  }
}
