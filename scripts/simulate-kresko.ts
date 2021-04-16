import { Kresko } from '../kresko';
import { cUSD, Token } from '../token';
import { User } from '../user';
import { logMinterStatistics } from '../utils';

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

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(0);
  });
