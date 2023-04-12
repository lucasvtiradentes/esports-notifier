const CONFIGS = {
  esports: {
    favoriteTeams: ['loud', 'mibr', 'imperial'], // specify your favorite teams
    games: {                                     // select the games you're interested
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
    timeToSendEmail: '07:00',                    // time to send the daily email if there is at least on game of your favorite teams
    diffHoursFromGmtTimezone: -3                 // specify the hour difference between your timezone and GMT timezone (UTC 0)
  },
  settings: {
    notifyOnlyAboutTodayGames: true,             // if 'false' it will alse send email in case of matchs of favorite teams in the next days
    strictTeamComparasion: false,                // if 'true' the name of the teams must be exact in all the matches source sites
    maintanceMode: false,                        // development option dont need to change
    loopFunction: 'checkTodayGames'              // development option dont need to change
  }
};

function getEsportsNotifier(){
  const version = "0.0.1"
  const content = UrlFetchApp.fetch(`https://cdn.jsdelivr.net/npm/esports-notifier@${version}`).getContentText();
  eval(content)
  const esportsNotifier = new EsportsNotifier(CONFIGS)
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