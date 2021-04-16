export const cUSD = 'cUSD';
export const kTSLA = 'kTSLA';
export const kGOOG = 'kGOOG';
export const kAPPL = 'kAPPL';
export const kUSDkAPPL = 'kUSDkAPPL';
export const kUSDkTSLA = 'kUSDkTSLA';
export const kUSDkGOOG = 'kUSDkGOOG';

class Erc20Token {
  balances = {};

  constructor(public name: string) {}

  mint(to: string, amount: number) {
    if (!this.balances[to]) {
      this.balances[to] = 0;
    }
    this.balances[to] += amount;
  }

  balanceOf(name: string) {
    return this.balances[name] || 0;
  }

  transfer(from: string, to: string, amount: number) {
    if (this.balanceOf[from] < amount) {
      console.log('Transfer amount exceeds balance');
      return;
    }

    if (!this.balances[to]) {
      this.balances[to] = 0;
    }

    this.balances[from] -= amount;
    this.balances[to] += amount;
  }

  totalSupply() {
    return Object.values(this.balances).reduce((total, amount) => {
      return (total as number) + (amount as number);
    }, 0);
  }
}

const tokens: { [x: string]: Erc20Token } = {};
export function Token(name: string) {
  if (!tokens[name]) {
    tokens[name] = new Erc20Token(name);
  }
  return tokens[name];
}
