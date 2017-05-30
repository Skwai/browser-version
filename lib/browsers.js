const useragent = require('useragent');
const browserslist = require('browserslist');
const { BROWSERSLIST_ALIASES, USERAGENT_ALIASES } = require('../config');

class Browsers {
  static getCurrentBrowser(userAgentHeader) {
    const ua = useragent.parse(userAgentHeader);
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

  static isBrowserSupported(browser = {}, supportedBrowsers = []) {
    const match = supportedBrowsers.find(b => b.name === browser.name);
    return match ? Number(match.version) <= Number(browser.version) : false;
  }

  static getSupportedBrowsers(query = '') {
    return browserslist(query)
      .map(browser => browser.split(' '))
      .filter(([name]) => name in BROWSERSLIST_ALIASES)
      .map(([name, version]) => ({
        name,
        displayName: BROWSERSLIST_ALIASES[name],
        version,
      }))
      .filter(({ name, version, displayName }, index, arr) => {
        const versions = arr.filter(item => item.name === name && item.version !== version)
          .map(item => item.version);
        return !versions.filter(val => Number(val) < version).length;
      });
  }
}

module.exports = Browsers;
