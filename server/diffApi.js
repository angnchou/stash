const axios = require('axios');
const diffApiKey = process.env.DIFF_API_KEY;

module.exports = {
  getInfo: url =>
    axios
      .get(
        `http://api.diffbot.com/v3/analyze?token=${diffApiKey}&url=${encodeURIComponent(
          url,
        )}`,
      )
      .then(result => {
        return {
          title: result.data.title,
        };
      }),
};
