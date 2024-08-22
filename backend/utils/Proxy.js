const { translate } = require('@vitalets/google-translate-api');
const { HttpProxyAgent } = require('http-proxy-agent');

const proxies = [
  'http://181.41.194.186:80',
  'http://74.48.78.52:80'
];

// List to keep track of proxies that failed
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

      // Log failed proxies
      if (error.message.includes('Too Many Requests') ||
          error.message.includes('Bad Gateway') ||
          error.message.includes('Proxy Error') ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('socket hang up') ||
          error.message.includes('ETIMEDOUT')) {
        failedProxies.push({ proxyUrl, error: error.message });
        continue; // Try the next proxy
      }

      // If the error is not related to proxy issues, stop retrying
      throw new Error('Translation failed with proxy.');
    }
  }

  // Log failed proxies if all proxies fail
  console.log('Proxies that failed:', failedProxies);
  throw new Error('Translation failed with all proxies.');
};

module.exports = {
  translateWithProxy
};
