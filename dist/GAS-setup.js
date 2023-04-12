const CONFIGS = {
  esports: {
    favoriteTeams: ['loud', 'mibr', 'imperial', 'syko'], // specify your favorite teams
    games: {                                             // select the games you're interested
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
    timeToSendEmail: '07:00',                            // time to send the daily email if there is at least on game of your favorite teams
    diffHoursFromGmtTimezone: -3                         // specify the hour difference between your timezone and GMT timezone (UTC 0)
  },
  settings: {
    notifyOnlyAboutTodayGames: true,                     // if 'false' it will alse send email in case of matchs of favorite teams in the next days
    strictTeamComparasion: false,                        // if 'true' the name of the teams must be exact in all the matches source sites
    maintanceMode: false,                                // development option dont need to change
    loopFunction: 'checkTodayGames'                      // development option dont need to change
  }
};

function getEsportsNotifier() {
  const version = "0.0.1"
  const content = getGithubFileContent('lucasvtiradentes/esports-notifier', 'master');
  eval(`this.EsportsNotifier = ` + content);
  const esportsNotifier = new EsportsNotifier(CONFIGS);
  return esportsNotifier;
}

function checkTodayGames() {
  const esportsNotifier = getEsportsNotifier();
  esportsNotifier.checkTodayGames();
}

function setup() {
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