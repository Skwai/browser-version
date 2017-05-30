const browserslist = require('browserslist');
const useragent = require('useragent');

const BROWSERSLIST_ALIASES = {
  safari: 'Safari',
  chrome: 'Chrome',
  ie: 'Internet Explorer',
  edge: 'Edge',
  opera: 'Opera',
  firefox: 'Firefox',
};

const USERAGENT_ALIASES = {
  IE: 'Internet Explorer',
};

function getCurrentBrowser(header) {  
  const ua = useragent.parse(header);
  const ba = BROWSERSLIST_ALIASES;
  const { family, major: version } = ua;

  const displayName = family in USERAGENT_ALIASES ? USERAGENT_ALIASES[family] : family;
  const name = Object.keys(BROWSERSLIST_ALIASES)
    .find(k => BROWSERSLIST_ALIASES[k] === displayName);

  return {
    displayName,
    name,
    version,
  };
}

function getSupportedBrowsers(query) {    
  const browsers = browserslist(query)
    .map(browser => browser.split(' '));

  return browsers
    .filter(([name, version]) => name in BROWSERSLIST_ALIASES)
    .map(([name, version]) => ({
      name,
      displayName: BROWSERSLIST_ALIASES[name],
      version,
    }))
    .filter(({ name, version, displayName }, index, arr) => {
      const versions = arr.filter((el) => el.name === name && el.version !== version).map((el) => el.version);
      return !versions.filter((v) => Number(v) < version).length;      
    });
}

module.exports = {
  get(req, res) {
    const { q } = req.query;

    if (!q) {
      res.statusCode = 401;
      res.json({ message: 'query param is required' })
    }

    const query = q.split(',').map((v) => v.trim());

    const supported = getSupportedBrowsers(query);
    const current = getCurrentBrowser(req.headers['user-agent']);

    const match = supported.find((b) => b.name === current.name);

    current.isSupported = match ? Number(match.version) <= Number(current.version) : false;

    res.json({
      current,
      supported,
    });
  },
};