const apiKeys = require('./apiKeys.js');

module.exports = {
  getScreenshotUrl: url =>
    `http://api.urlbox.io/v1/${apiKeys.urlboxApi}/png?url=${encodeURIComponent(
      url,
    )}&thumb_width=100`,
};
