import { kTSLA, kAPPL, kGOOG, Token, cUSD } from './token';

export class Kresko {
  prices = {
    [kTSLA]: 10,
    [kGOOG]: 40,
    [kAPPL]: 90,
  };

  targetCollateralisationRatio = 5;

  constructor() {
    setInterval(() => {
      for (const stock of this.getWhitelistedAssets()) {
        const volatilities = {
          kTSLA: 100,
          kGOOG: 25,
          kAPPL: 10,
        };
        const update = Math.random() * 100 < volatilities[stock.name];
        if (update) {
          const up = Math.random() < 0.5;
          const deviation = Math.random() * 3;
          this.updatePrice(
            stock.name,
            up
              ? this.getPrice(stock.name) + deviation
              : this.getPrice(stock.name) - deviation
          );
        }
      }
    }, 2000);
  }

  updatePrice(name: string, price: number) {
    this.prices[name] = price;
  }

  addCollateral(user: string, name: string, amount: number) {
    const minted =
      amount / this.targetCollateralisationRatio / this.prices[name];

    Token(cUSD).transfer(user, 'Kresko', amount);
    Token(`kUSD${name}`).mint(user, amount);
    Token(name).mint(user, minted);
  }

  getPrice(name) {
    return this.prices[name] ?? 0;
  }

  getRatio(user: string, name: string) {
    return (
      (Token(`kUSD${name}`).balanceOf(user) /
        (this.getPrice(name) * Token(name).balanceOf(user))) *
      100
    );
  }

  getWhitelistedAssets() {
    return Object.keys(this.prices).map((name) => ({
      name,
      price: this.prices[name],
    }));
  }
}
