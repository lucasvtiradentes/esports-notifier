export const config = {
  esports: {
    favoriteTeams: ['loud', 'mibr', 'imperial', 'syko'],
    games: {
      dota: false,
      lol: false,
      rocketLeague: false,
      csgo: true,
      valorant: true,
      rainbowSixSiege: true,
      freeFire: false,
      callOfDuty: false,
      overwatch: false
    }
  },
  datetime: {
    timeToSendEmail: '07:00',
    diffHoursFromUtc: -3
  },
  settings: {
    strictTeamComparasion: false,
    maintanceMode: false,
    loopFunction: 'checkTodayGames'
  }
};
