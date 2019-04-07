const urlApi = process.env.URL_API_KEY;

module.exports = {
  getScreenshotUrl: url =>
    `http://api.urlbox.io/v1/${urlApi}/png?url=${encodeURIComponent(
      url,
    )}&thumb_width=100`,
};
