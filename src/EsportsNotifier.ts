/* eslint-disable @typescript-eslint/no-explicit-any */

type Config = {
  timeToSendEmail: string;
  diffHoursFromUtc: number;
  favoriteTeams: string[];
  strictComparasion: boolean;
  games: {
    csgo: boolean;
    valorant: boolean;
    rainbowSixSiege: boolean;
    dota: boolean;
    lol: boolean;
    rocketLeague: boolean;
    overwatch: boolean;
    callOfDuty: boolean;
    freeFire: boolean;
  };
};

type Games = keyof Config['games'];

type Game = {
  game: Games;
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
  link: string;
};

type Environment = 'production' | 'development';

type CheerioItem = any;

/* -------------------------------------------------------------------------- */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class EsportsNotifier {
  VERSION = ''; // version
  APPNAME = 'esports-notifier';
  GITHUB_REPOSITORY = 'lucasvtiradentes/esports-notifier';
  TODAY_DATE = new Date().toISOString().split('T')[0];
  ENVIRONMENT = this.detectEnvironment();
  APPS_SCRIPTS_PROPERTIES = {
    todayTicktickAddedTasks: 'todayTicktickAddedTasks',
    todayTicktickUpdateTasks: 'todayTicktickUpdateTasks',
    todayTicktickCompletedTasks: 'todayTicktickCompletedTasks',
    todayGithubAddedCommits: 'todayGithubAddedCommits',
    todayGithubDeletedCommits: 'todayGithubDeletedCommits',
    lastReleasedVersionAlerted: 'lastReleasedVersionAlerted'
  };
  ERRORS = {
    mustSpecifyConfig: 'You must specify the settings when starting the class'
  };

  constructor(public config: Config) {
    this.validateConfigs(config);
    this.config = config;
  }

  private validateConfigs(config: Config) {
    if (!config) {
      throw new Error(this.ERRORS.mustSpecifyConfig);
    }

    const validationArr = [
      { objToCheck: config, requiredKeys: ['timeToSendEmail', 'diffHoursFromUtc', 'favoriteTeams', 'strictComparasion', 'games'], name: 'configs' },
      { objToCheck: config.games, requiredKeys: ['csgo', 'valorant', 'rainbowSixSiege', 'dota', 'lol', 'rocketLeague', 'overwatch', 'callOfDuty', 'freeFire'], name: 'configs.games' }
    ];

    validationArr.forEach((item) => {
      const { objToCheck, requiredKeys, name } = item;
      requiredKeys.forEach((key) => {
        if (!objToCheck || !Object.keys(objToCheck).includes(key)) {
          throw new Error(`missing key in ${name}: ${key}`);
        }
      });
    });
  }

  /* LOGGER FUNCTIONS ======================================================= */

  private logger(message: string) {
    console.log(message);
  }

  /* DETECT ENVIRONMENT FUNCTION============================================= */
  private detectEnvironment(): Environment {
    if (typeof Calendar === 'undefined') {
      return 'development';
    } else {
      return 'production';
    }
  }

  /* LOGGER FUNCTIONS ======================================================= */

  check() {
    const csgoMatches = this.getCsgoMatches();
    const r6Matches = this.getR6Matches();
    const valorantMatches = this.getValorantMatches();

    const allMatches = [...csgoMatches, ...r6Matches, ...valorantMatches];
    const favoriteTeamsMatches = allMatches.filter((item) => item.teams.some((matchTeam) => this.config.favoriteTeams.includes(matchTeam.toLowerCase())));

    console.log(favoriteTeamsMatches);
    console.log(allMatches.length);
    console.log(favoriteTeamsMatches.length);
  }

  parseHtmlData(content: string) {
    const cheerioLib = globalThis.Cheerio as any;
    return cheerioLib.load(content);
  }

  getCsgoMatches() {
    const LIQUEDPEDIA_LINK = 'https://liquipedia.net';
    const CSGO_API = `${LIQUEDPEDIA_LINK}/counterstrike/Main_Page`;

    const content = UrlFetchApp.fetch(CSGO_API, { muteHttpExceptions: true }).getContentText();
    const $ = this.parseHtmlData(content);
    const csgoMatches = $('table.infobox_matches_content');

    const getTeamName = (item) => {
      const foundItem = item.children.find((it) => it.attribs?.class.search('team-template-text') > -1);
      return foundItem?.children[0]?.children[0]?.data;
    };

    const getTeamImage = (item) => {
      const foundItem = item.children.find((it) => it.attribs?.class.search('team-template-image-icon') > -1);
      return foundItem?.children[0]?.children[0]?.attribs?.src;
    };

    const matchesInfoArr = Array.from(csgoMatches).map((item: CheerioItem) => {
      const dateTime = item.children[1].children[2].children[1].children[0].children[0].children[0].data;
      const teamAElement = item.children[1].children[0].children[1].children[0];
      const teamBElement = item.children[1].children[0].children[5].children[0];
      const matchDate = dateTime.split(' - ')[0];
      const matchTime = dateTime.split(' - ')[1];
      const event = item.children[1].children[2].children[1].children[1].children[0].children[0].children[0].data;
      const link = '';
      const teamAName = getTeamName(teamAElement);
      const teamAImage = getTeamImage(teamAElement);
      const teamACountryImage = '';
      const teamBName = getTeamName(teamBElement);
      const teamBImage = getTeamImage(teamBElement);
      const teamBCountryImage = '';

      const gameInfo: Game = {
        game: 'csgo',
        teamA: {
          name: teamAName,
          image: `${LIQUEDPEDIA_LINK}${teamAImage}`,
          countryImage: teamACountryImage
        },
        teamB: {
          name: teamBName,
          image: `${LIQUEDPEDIA_LINK}${teamBImage}`,
          countryImage: teamBCountryImage
        },
        teams: [teamAName, teamBName],
        date: matchDate,
        time: matchTime,
        event: event,
        link: `${LIQUEDPEDIA_LINK}${link}`
      };

      return gameInfo;
    });

    return matchesInfoArr;
  }

  getR6Matches() {
    const RAINBOW_SIX_SOURCE = 'https://siege.gg';
    const RAINBOW_SIX_SIEGE_MATCHES_PAGE = `${RAINBOW_SIX_SOURCE}/matches`;
    const content = UrlFetchApp.fetch(RAINBOW_SIX_SIEGE_MATCHES_PAGE, { muteHttpExceptions: true }).getContentText();
    const $ = this.parseHtmlData(content);

    const r6Matches = $('a.match--awaiting-results'); // match--has-results
    const matchesInfoArr = Array.from(r6Matches).map((item: CheerioItem) => {
      // const dateTime = item.children[0].attribs['data-time']
      const matchDate = item.children[0].children[0].children[0].data;
      const matchTime = item.children[0].children[1].children[0].data;
      const event = item.children[0].children[2].children[0].data;
      const link = item.attribs.href;
      const teamAName = item.children[1].children[0].children[0].children[2].children[0].data.trim();
      const teamAImage = item.children[1].children[0].children[0].children[0].attribs.src;
      const teamACountryImage = item.children[1].children[0].children[0].children[1].children[0].attribs.src;
      const teamBName = item.children[1].children[2].children[0].children[2].children[0].data.trim();
      const teamBImage = item.children[1].children[2].children[0].children[0].attribs.src;
      const teamBCountryImage = item.children[1].children[2].children[0].children[1].children[0].attribs.src;

      const gameInfo: Game = {
        game: 'rainbowSixSiege',
        teamA: {
          name: teamAName,
          image: teamAImage,
          countryImage: teamACountryImage
        },
        teamB: {
          name: teamBName,
          image: teamBImage,
          countryImage: teamBCountryImage
        },
        teams: [teamAName, teamBName],
        date: matchDate,
        time: matchTime,
        event: event,
        link: `${RAINBOW_SIX_SOURCE}${link}`
      };

      return gameInfo;
    });

    return matchesInfoArr;
  }

  getValorantMatches() {
    const VALORANT_API = 'https://www.vlr.gg/matches';
    const content = UrlFetchApp.fetch(VALORANT_API).getContentText();
    const $ = this.parseHtmlData(content);

    const valorantMatches = $('a.match-item');

    const matchesInfoArr = Array.from(valorantMatches).map((item: CheerioItem) => {
      const matchDate = item.parent.prev.prev.children[0].data.trim();
      const matchTime = item.children[0].next.children[0].data.trim();
      const event = item.children[13].children[2].data.trim();
      const teamAName = item.children[3].children[1].children[1].children[1].children[2].data.trim();
      const teamAImage = '';
      const teamACountryImage = item.children[3].children[1].children[1].children[1].children[1].attribs.class.replace('flag ', '');
      const teamBName = item.children[3].children[3].children[1].children[1].children[2].data.trim();
      const teamBImage = '';
      const teamBCountryImage = item.children[3].children[3].children[1].children[1].children[1].attribs.class.replace('flag ', '');

      const gameInfo: Game = {
        game: 'valorant',
        teamA: {
          name: teamAName,
          image: teamAImage,
          countryImage: teamACountryImage
        },
        teamB: {
          name: teamBName,
          image: teamBImage,
          countryImage: teamBCountryImage
        },
        teams: [teamAName, teamBName],
        date: matchDate,
        time: matchTime,
        event: event,
        link: item.attribs.href
      };

      return gameInfo;
    });

    return matchesInfoArr;
  }
}
