const { translate } = require('@vitalets/google-translate-api');
const { HttpProxyAgent } = require('http-proxy-agent');

const proxies = [
  "http://207.154.219.88:80",
  "http://208.104.211.63:80",
  "http://72.10.160.93:13931",
  "http://67.43.236.19:17293",
  "http://200.174.198.86:8888",
  "http://72.10.160.171:10095",
  "http://198.74.51.79:8888"
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
