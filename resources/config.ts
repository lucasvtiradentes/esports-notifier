// prettier-ignore
export const config = {
  esports: {
    favoriteTeams: ['loud', 'mibr', 'imperial'], // specify your favorite teams
    games: {                                     // select the games you're interested
      csgo: true,
      valorant: true,
      rainbowSixSiege: true
    }
  },
  datetime: {
    timeToSendEmail: '07:00',                    // time to send the daily email if there is at least on game of your favorite teams
    diffHoursFromGmtTimezone: -3                 // specify the hour difference between your timezone and GMT/UTC timezone | https://www.utctime.net/ | -3 means that in my timezone (15h) is 3 hours behind from utc timezone (18h).
  },
  settings: {
    notifyOnlyAboutTodayGames: true,             // if 'false' it will alse send email in case of matchs of favorite teams in the next days
    strictTeamComparasion: false,                // if 'true' the name of the teams must be exact in all the matches source sites
    maintanceMode: false,                        // development option dont need to change
    loopFunction: 'checkTodayGames'              // development option dont need to change
  }
};
