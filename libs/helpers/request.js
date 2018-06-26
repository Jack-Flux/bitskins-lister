const request = require('request');

class Request {
  constructor(base) {
    this.base = base;
  }

  convertParams(params) {
    let paramString = Object.keys(params).length > 0 ? '?' : '';
    Object.keys(params).forEach((key) => {
      paramString += `${key}=${params[key]}&`;
    });
    return paramString;
  }

  get(path, params) {
    return new Promise((resolve) => {
      request.get(`${this.base}/${path}${this.convertParams(params)}`, (err, resp, body) => {
        resolve(JSON.parse(body));
      });
    });
  }
}

module.exports = Request;