import { Kresko } from './kresko';
import { Token } from './token';
import { User } from './user';

export function logMinterStatistics(users: User[], k: Kresko) {
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
