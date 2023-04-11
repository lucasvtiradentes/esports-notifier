export const config = {
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
