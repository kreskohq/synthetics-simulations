class Kresko {
  prices = {
    TSLA: 10,
    GOOG: 40,
    APPL: 90,
  };

  totalDebt = 0;

  balances = {};
  assets = {};

  targetCollateralisationRatio = 5;

  constructor() {}

  updatePrice(name: string, price: number) {
    this.prices[name] = price;
  }

  addCollateral(user: string, name: string, amount: number) {
    if (!this.assets[user]) {
      this.assets[user] = {};
    }
    if (!this.balances[user]) {
      this.balances[user] = {};
    }

    if (!this.assets[user][name]) {
      this.assets[user][name] = 0;
    }
    if (!this.balances[user][name]) {
      this.balances[user][name] = 0;
    }

    const minted =
      amount / this.targetCollateralisationRatio / this.prices[name];
    this.balances[user][name] += amount;
    this.assets[user][name] += minted;
    this.totalDebt += amount;
  }

  getPrice(name) {
    return this.prices[name] ?? 0;
  }

  getSyntheticAssetBalance(user: string, name: string) {
    return this.assets[user]?.[name] ?? 0;
  }

  getAssetBalance(user: string, name: string) {
    return this.balances[user]?.[name] ?? 0;
  }

  getRatio(user: string, name: string) {
    return (
      (this.getAssetBalance(user, name) /
        (this.getPrice(name) * this.getSyntheticAssetBalance(user, name))) *
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

const users = ['Jeff', 'Tim', 'Steve'];

async function main() {
  const k = new Kresko();

  for (const { name } of k.getWhitelistedAssets()) {
    for (const user of users) {
      k.addCollateral(user, name, Math.random() * 10000);
    }
  }

  setInterval(() => {
    for (const stock of k.getWhitelistedAssets()) {
      const volatilities = {
        TSLA: 100,
        GOOG: 25,
        APPL: 10,
      };
      const update = Math.random() * 100 < volatilities[stock.name];
      if (update) {
        const up = Math.random() < 0.5;
        const deviation = Math.random() * 5;
        k.updatePrice(
          stock.name,
          up
            ? k.getPrice(stock.name) + deviation
            : k.getPrice(stock.name) - deviation
        );
      }
    }

    const assets = {};
    for (const user of users) {
      assets[user] = {};
      for (const stock of k.getWhitelistedAssets()) {
        const assetPrice = k.prices[stock.name] ?? 0;
        const assetCount = k.assets[user][stock.name] ?? 0;
        const tableHeader = `${stock.name} $${assetPrice.toFixed(2)}`;
        const dollarValue = (assetCount * k.prices[stock.name]).toFixed();
        const ratio = k.getRatio(user, stock.name).toFixed();
        assets[user][
          tableHeader
        ] = `${assetCount.toFixed()} ($${dollarValue}) (CR ${ratio}%)`;
      }
    }
    console.table(assets);
  }, 2000);

  await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 60 * 24));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(0);
  });
