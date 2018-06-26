const totp = require('notp').totp;
const base32 = require('thirty-two');

const Request = require('./helpers/request');

class Bitskins {
  constructor(apiKey, secret) {
    if (!apiKey || !secret) {
      throw new Error(`Missing ${apiKey ? 'secret' : secret ? 'apiKey' : 'apiKey and secret'}`);
    }
    this.request = new Request('https://bitskins.com/api/v1/');
    this.apiKey = apiKey;
    this.secret = secret;
  }

  generate2fa() {
    return totp.gen(base32.decode(this.secret));
  }

  async req(path, params = {}) {
    params.api_key = this.apiKey;
    params.code = this.generate2fa();
    const data = await this.request.get(path, params);
    return data;
  }

  async steamInventory() {
    const inventory = await this.req('get_my_inventory');
    const steamInventory = inventory.data.steam_inventory.items;
    return steamInventory;
  }

  async lowestPrices(items) {
    const priceList = await this.req('get_price_data_for_items_on_sale', { app_id: 730 });
    const itemNames = items.map(item => item.market_hash_name);
    const data = {};
    priceList.data.items.forEach((item) => {
      if (itemNames.includes(item.market_hash_name)) {
        data[item.market_hash_name] = item;
      }
    });
    return data;
  }

  async sendTrade(offer) {
    const itemIds = offer.map(i => i.item_id);
    const itemPrices = offer.map(i => i.price);
    const trade = await this.req('list_item_for_sale', { item_ids: itemIds, prices: itemPrices });
    return trade;
  }
}

module.exports = Bitskins;