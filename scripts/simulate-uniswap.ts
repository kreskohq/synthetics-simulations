import { Kresko } from '../kresko';
import { cUSD, kAPPL, Token, kGOOG, kTSLA, kUSDkAPPL } from '../token';
import { Uniswap } from '../uniswap';
import { User } from '../user';
import { logMinterStatistics } from '../utils';

async function uniswap() {
  const uni = new Uniswap();
  const k = new Kresko();

  uni.addPair(cUSD, kAPPL);
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

uniswap()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(0);
  });
