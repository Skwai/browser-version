const Browsers = require('../lib/browsers');

module.exports = {
  get(req, res) {
    const { query } = req.query;

    if (!query) {
      res.statusCode = 422;
      return res.json({ message: '`query` param is required' });
    }

    const queries = query.split(',').map(val => val.trim());
    let supportedBrowsers;

    try {
      supportedBrowsers = Browsers.getSupportedBrowsers(queries);
    } catch (err) {
      res.statusCode = 422;
      return res.json({ message: 'invalid `query` param supplied' });
    }

    const userAgentHeader = req.headers['user-agent'];
    const currentBrowser = userAgentHeader ? Browsers.getCurrentBrowser(userAgentHeader) : null;

    if (currentBrowser) {
      currentBrowser.isSupported = Browsers.isBrowserSupported(currentBrowser, supportedBrowsers);
    }

    return res.json({
      currentBrowser,
      supportedBrowsers,
    });
  },
};
