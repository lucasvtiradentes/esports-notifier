export type GameOption = {
  sync: boolean;
  teams: string[];
};

export type TConfigs = {
  esports: {
    favoriteTeams: string[];
    games: {
      csgo: GameOption;
      valorant: GameOption;
      rainbowSixSiege: GameOption;
      leagueOfLegends: GameOption;
      rocketLeague: GameOption;
      dota: GameOption;
      callOfDuty: GameOption;
    };
  };
  datetime: {
    diffHoursFromGmtTimezone: number;
    timeToSendEmail: string;
  };
  settings: {
    notifyOnlyAboutTodayGames: boolean;
    strictTeamComparasion: boolean;
    maintanceMode: boolean;
    loopFunction: string;
  };
};

export type TExtendedConfigs = {
  configs: TConfigs | null;
  environment: TEnvironment;
  today_date: string;
  user_email: string;
};

export type TGameName = keyof TConfigs['esports']['games'];

export type TMatchInfo = {
  game: {
    name: TGameName;
    image: string;
    link: string;
  };
  teamA: {
    name: string;
    image: string;
    countryImage: string;
  };
  teamB: {
    name: string;
    image: string;
    countryImage: string;
  };
  teams: string[];
  date: string;
  time: string;
  event: string;
  eventLink: string;
  link: string;
};

export type TEnvironment = 'production' | 'development';

export type TCheerioItem = any;
