const CONFIGS = {
  esports: {
    favoriteTeams: ['loud', 'mibr', 'imperial', 'syko'],
    games: {
      csgo: true,
      valorant: true,
      rainbowSixSiege: true,
      dota: false,
      lol: false,
      rocketLeague: false,
      overwatch: false,
      callOfDuty: false,
      freeFire: false
    }
  },
  datetime: {
    timeToSendEmail: '07:00',
    diffHoursFromUtc: -3
  },
  settings: {
    notifyOnlyAboutTodayGames: true,
    strictTeamComparasion: false,
    maintanceMode: false,
    loopFunction: 'checkTodayGames'
  }
};

function getEsportsNotifier() {
  const content = getGithubFileContent('lucasvtiradentes/esports-notifier', 'master');
  eval(`this.EsportsNotifier = ` + content);
  const esportsNotifier = new EsportsNotifier(CONFIGS);
  return esportsNotifier;
}

function checkTodayGames() {
  const esportsNotifier = getEsportsNotifier();
  esportsNotifier.checkTodayGames();
}

function install() {
  const esportsNotifier = getEsportsNotifier();
  esportsNotifier.install();
}

function uninstall() {
  const esportsNotifier = getEsportsNotifier();
  esportsNotifier.uninstall();
}

function getGithubFileContent(repository, branch) {
  const filePath = 'dist/EsportsNotifier.min.js';
  const final_link = `https://api.github.com/repos/${repository}/contents/${filePath}${branch ? `?ref=${branch}` : ''}`;
  const response = UrlFetchApp.fetch(final_link, { method: 'get', contentType: 'application/json' });
  const base64Content = JSON.parse(response.toString()).content;
  const decodedArr = Utilities.base64Decode(base64Content);
  const decodedAsString = Utilities.newBlob(decodedArr).getDataAsString();
  return decodedAsString;
}