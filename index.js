const Bitskins = require('./libs/bitskins');
const config = require('./config.json');

if (!config || !config.bitskins) {
  throw new Error('Please create a config file with the appropriate bitskins attributes');
}

const bitskins = new Bitskins(config.bitskins.apiKey, config.bitskins.secret);

async function run() {
  const inventory = await bitskins.steamInventory();
  const itemPrices = await bitskins.lowestPrices(inventory);
  let total = 0.00;
  const tradeData = [];
  // Loops through user's steam inventory
  inventory.forEach((item, i) => {
    // Checks for invalid or nonexistant pricing
    if (!itemPrices[item.market_hash_name] || !itemPrices[item.market_hash_name].lowest_price || itemPrices[item.market_hash_name].lowest_price < 0.15) {
      console.log(`No price found for ${item.number_of_items}x ${item.market_hash_name}`);
    } else {
      console.log(`Selling ${item.number_of_items}x ${item.market_hash_name} for ${(itemPrices[item.market_hash_name].lowest_price - 0.1).toFixed(2) || 0.00} each`);
      // Adds each item's item_id to tradeData with a price (0.1 below the current lowest listing)
      item.item_ids.forEach((id) => {
        tradeData.push({
          item_id: id,
          price: parseFloat((itemPrices[item.market_hash_name].lowest_price - 0.1).toFixed(2)),
        });
        total += itemPrices[item.market_hash_name].lowest_price - 0.1;
      });
    }
  });
  console.log('---------------------------------------------------------------------');
  console.log(`Total: ${total.toFixed(2)}`);
  // Splits the all items into groups of 100 as per the API limit and sends the trade
  while(tradeData.length) {
    const currentTrade = tradeData.splice(0, 100);
    console.log(currentTrade);
    const trade = await bitskins.sendTrade(currentTrade);
    console.log(`Trade: ${trade.status}`);
  }
}

run();