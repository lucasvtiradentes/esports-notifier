const CONFIGS = {
    esports: {
      favoriteTeams: ['mibr'],              // specify your global favorite teams, that will be search in all games
      games: {                              // select the games you're interested
        csgo: {
          sync: true,
          teams: ['imperial']               // specify the teams you want to search only in this game
        },
        valorant: {
          sync: true,
          teams: ['sentinels', 'furia', 'loud', 'mibr']
        },
        rainbowSixSiege: {
          sync: true,
          teams: ['nip', 'faze', 'liquid', 'w7m']
        },
        leagueOfLegends: {
          sync: true,
          teams: []
        },
        rocketLeague: {
          sync: true,
          teams: []
        },
        dota: {
          sync: true,
          teams: []
        },
        callOfDuty: {
          sync: true,
          teams: []
        }
      }
    },
    datetime: {
      timeToSendEmail: '07:00',                    // time to send the daily email if there is at least on game of your favorite teams
      diffHoursFromGmtTimezone: -3                 // specify the hour difference between your timezone and GMT/UTC timezone | https://www.utctime.net/ | -3 means that in my timezone (15h) is 3 hours behind from utc timezone (18h).
    },
    settings: {
      notifyOnlyAboutTodayGames: true,             // if 'false' it will alse send email in case of matchs of favorite teams in the next days
      strictTeamComparasion: true,                 // if 'true' the name of the teams must be exact in all the matches source sites
      maintanceMode: false,                        // development option, dont need to change
      loopFunction: 'checkTodayGames'              // development option, dont need to change
    }
  };

function getEsportsNotifier(){

  let esportsNotifier;
  const useDevVersion = false

  if (useDevVersion){
    const EsportsNotifier = getEsportsNotifierDev()
    esportsNotifier = new EsportsNotifier(CONFIGS);
  } else {
    const version = "1.2.1"
    const content = UrlFetchApp.fetch(`https://cdn.jsdelivr.net/npm/esports-notifier@${version}`).getContentText();
    eval(content)
    esportsNotifier = new EsportsNotifier(CONFIGS);
  }

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