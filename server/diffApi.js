const axios = require('axios');
const apiKeys = require('./apiKeys.js');

module.exports = {
  getInfo: url =>
    axios
      .get(
        `http://api.diffbot.com/v3/analyze?token=${
          apiKeys.diffApi
        }&url=${encodeURIComponent(url)}`,
      )
      .then(result => {
        return {
          title: result.data.title,
          image: result.data['objects'][0]['images'],
          url: result.request.pageUrl,
        };
      }),
};
