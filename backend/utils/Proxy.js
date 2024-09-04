const { translate } = require('@vitalets/google-translate-api');
const { HttpProxyAgent } = require('http-proxy-agent');

const proxies = [
  "http://154.65.39.7:80",
  "http://191.101.80.162:80",
  "http://203.115.101.55:80",
  "http://49.228.131.169:5000",
  "http://72.10.160.174:13093",
  "http://67.43.228.250:26991",
  "http://200.60.145.167:8081",
  "http://51.255.20.138:80",
  "http://154.65.39.8:80"
];

const failedProxies = [];

const translateWithProxy = async (text) => {
  for (let i = 0; i < proxies.length; i++) {
    const proxyUrl = proxies[i];
    const agent = new HttpProxyAgent(proxyUrl);

    try {
      const result = await translate(text, {
        from: 'en',
        to: 'zh-CN',
        fetchOptions: { agent }
      });
      return result.text;
    } catch (error) {
      console.error('Error with proxy:', proxyUrl, error.message);

      if (error.response) {
        try {
          const responseBody = await error.response.text();
          console.error('Response body:', responseBody);
        } catch (err) {
          console.error('Failed to read response body:', err.message);
        }
      }

      if (error.message.includes('Too Many Requests') ||
          error.message.includes('Bad Gateway') ||
          error.message.includes('Proxy Error') ||
          error.message.includes('Not Found') ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('Service Unavailable') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('socket hang up') ||
          error.message.includes('ETIMEDOUT')) {
        failedProxies.push({ proxyUrl, error: error.message });
        continue; // Try the next proxy
      }

      throw new Error('Translation failed with proxy.');
    }
  }

  console.log('Proxies that failed:', failedProxies);
  throw new Error('Translation failed with all proxies.');
};

module.exports = {
  translateWithProxy
};
