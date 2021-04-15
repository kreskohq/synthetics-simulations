const cUSD = 'cUSD';
const kTSLA = 'kTSLA';
const kGOOG = 'kGOOG';
const kAPPL = 'kAPPL';
const kUSDkAPPL = 'kUSDkAPPL';
const kUSDkTSLA = 'kUSDkTSLA';
const kUSDkGOOG = 'kUSDkGOOG';

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
function Token(name: string) {
  if (!tokens[name]) {
    tokens[name] = new Erc20Token(name);
  }
  return tokens[name];
}

class User {
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
}

class Pair {
  constructor(public id: string) {}

  swap(from: string, amount: number, token0: string, token1: string) {
    // (Ra - Da)(Rb + Db) = k or x * y = k
    // x and y are the reserves of each asset

    const reserveA = tokens[token0].balanceOf(this.id);
    const reserveB = tokens[token1].balanceOf(this.id);

    // (5 * b) / a;
    const swapAmount = amount * reserveB * reserveA;
    tokens[token0].transfer(from, this.id, swapAmount);
    tokens[token1].transfer(this.id, from, swapAmount);
  }
}

class Uniswap {
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

class Kresko {
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

function logMinterStatistics(users: User[], k: Kresko) {
  const assets = {};
  for (const user of users) {
    assets[user.name] = {};
    for (const stock of k.getWhitelistedAssets()) {
      const assetPrice = k.getPrice(stock.name);
      const assetCount = Token(stock.name).balanceOf(user.name);
      const tableHeader = `${stock.name} $${assetPrice.toFixed(2)}`;
      const dollarValue = (assetCount * assetPrice).toFixed();
      const ratio = k.getRatio(user.name, stock.name).toFixed();
      assets[user.name][
        tableHeader
      ] = `${assetCount.toFixed()} ($${dollarValue}) (CR ${ratio}%)`;
    }
  }
  console.table(assets);
}

async function main() {
  const k = new Kresko();

  const minters = [new User('John'), new User('Tim'), new User('Steve')];
  for (const stock of k.getWhitelistedAssets()) {
    for (const user of minters) {
      Token(cUSD).mint(user.name, 100_000);
      k.addCollateral(user.name, stock.name, Math.random() * 10_000);
    }
  }

  setInterval(() => {
    logMinterStatistics(minters, k);
  }, 2000);

  await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 60 * 24));
}

async function uniswap() {
  const uni = new Uniswap();
  const k = new Kresko();

  uni.addPair(cUSD, kTSLA);
  uni.addPair(cUSD, kGOOG);
  uni.addPair(cUSD, kAPPL);
  uni.addPair(kGOOG, kTSLA);
  uni.addPair(kGOOG, kAPPL);
  uni.addPair(kTSLA, kAPPL);

  const minters = [new User('John'), new User('Tim'), new User('Steve')];
  for (const stock of k.getWhitelistedAssets()) {
    for (const minter of minters) {
      Token(cUSD).mint(minter.name, 100_000);
      k.addCollateral(minter.name, stock.name, Math.random() * 50_000);
    }
  }
  logMinterStatistics(minters, k);

  for (const stock of k.getWhitelistedAssets()) {
    for (const minter of minters) {
      const stockBalance = Token(stock.name).balanceOf(minter.name);
      const usdAmount = stockBalance * k.getPrice(stock.name);
      minter.addLiquidity(cUSD, usdAmount, stock.name, stockBalance);
    }
  }

  logMinterStatistics(minters, k);

  // const traders = [new User(''), new User(''), new User('')];

  // john.addLiquidity(cUSD, 100, kTSLA, 10);

  // const pair = uni.getPair(cUSD, kTSLA);
  // pair.swap(john.name, 5, cUSD, kTSLA);

  // console.table({
  //   JOHN_cUSD: Token(cUSD).balanceOf(john.name),
  //   JOHN_kTLSA: Token(kTSLA).balanceOf(john.name),
  // });
}

// main()
uniswap()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(0);
  });
