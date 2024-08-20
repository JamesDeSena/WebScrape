const { translate } = require('@vitalets/google-translate-api');
const { HttpProxyAgent } = require('http-proxy-agent'); // Ensure this is the correct import

// List of proxies
const proxies = [
  'http://197.255.125.12:80',
  'http://165.232.129.150:80',
  'http://34.135.166.24:80',
  'http://23.137.248.197:8888',
  'http://51.75.206.209:80',
  'http://51.254.78.223:80',
  'http://198.74.51.79:8888',
  'http://181.41.194.186:80',
  'http://184.191.162.4:3128',
  'http://74.48.78.52:80'
];

const getRandomProxy = () => {
  const randomIndex = Math.floor(Math.random() * proxies.length);
  return proxies[randomIndex];
};

const translateWithProxy = async (text) => {
  const proxyUrl = getRandomProxy();
  const agent = new HttpProxyAgent(proxyUrl); // Make sure this matches the constructor

  try {
    const result = await translate(text, {
      from: 'en',
      to: 'zh-CN',
      fetchOptions: { agent }
    });
    return result.text;
  } catch (error) {
    console.error('Error with proxy:', proxyUrl, error.message);
    throw new Error('Translation failed with proxy.');
  }
};

module.exports = {
  translateWithProxy
};
