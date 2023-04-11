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
  gameLink: string;
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
  APPNAME = 'esports notifier';
  GITHUB_REPOSITORY = 'lucasvtiradentes/esports-notifier';
  TODAY_DATE = '';
  SESSION_LOGS = [];
  ENVIRONMENT = this.detectEnvironment();
  USER_EMAIL = this.ENVIRONMENT === 'production' ? this.getUserEmail() : '';
  ERRORS = {
    mustSpecifyConfig: 'You must specify the settings when starting the class'
  };
  public todayMatches: Game[] = [];
  public todayFavoriteTeamsMatches: Game[] = [];

  constructor(public config: Config) {
    this.validateConfigs(config);
    this.config = config;
    this.TODAY_DATE = this.getDateFixedByTimezone(this.config.diffHoursFromUtc).toISOString().split('T')[0];

    this.logger(`${this.APPNAME} is running at version ${this.VERSION} in ${this.ENVIRONMENT} environment`);
    this.logger(`check the docs for your version here: ${`https://github.com/${this.GITHUB_REPOSITORY}/tree/v${this.VERSION}#readme`}`);
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

  private detectEnvironment(): Environment {
    if (typeof UrlFetchApp === 'undefined') {
      return 'development';
    } else {
      return 'production';
    }
  }

  private logger(message: string) {
    this.SESSION_LOGS.push(message);
    console.log(message);
  }

  /* HELPER FUNCTIONS ======================================================= */

  private getDateFixedByTimezone(timeZoneIndex: number) {
    const date = new Date();
    date.setHours(date.getHours() + timeZoneIndex);
    return date;
  }

  private parseHtmlData(content: string) {
    const cheerioLib = globalThis.Cheerio as any;
    return cheerioLib.load(content);
  }

  private getUserEmail() {
    if (this.ENVIRONMENT === 'production') {
      return Session.getActiveUser().getEmail();
    }

    return '';
  }

  private getPageContent(url: string) {
    if (this.ENVIRONMENT === 'production') {
      return UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText();
    }

    return '';
  }

  /* GET MATCHES FUNCTIONS ================================================== */

  private getCsgoMatches() {
    const LIQUEDPEDIA_LINK = 'https://liquipedia.net';
    const CSGO_API = `${LIQUEDPEDIA_LINK}/counterstrike/Liquipedia:Matches`; // /Main_Page

    const content = this.getPageContent(CSGO_API);
    const $ = this.parseHtmlData(content);
    const csgoMatches = $('table.infobox_matches_content');

    // data-toggle-area-content
    const getTeamName = (item) => {
      const foundItem = item.children.find((it) => it.attribs?.class.search('team-template-text') > -1);
      return foundItem?.children[0]?.children[0]?.data;
    };

    const getTeamImage = (item) => {
      const foundItem = item.children.find((it) => it.attribs?.class.search('team-template-image-icon') > -1);
      return foundItem?.children[0]?.children[0]?.attribs?.src;
    };

    const matchesInfoArr = Array.from(csgoMatches)
      .filter((item: CheerioItem) => item.parent.attribs['data-toggle-area-content'] === '1')
      .map((item: CheerioItem) => {
        const dateTime = item.children[1].children[2].children[1].children[0].children[0].children[0].data;
        const teamAElement = item.children[1].children[0].children[1].children[0];
        const teamBElement = item.children[1].children[0].children[5].children[0];
        const matchDate = dateTime.split(' - ')[0];
        const matchTime = dateTime.split(' - ')[1];
        const event = item.children[1].children[2].children[1].children[1].children[0].children[0].children[0].data;
        const teamAName = getTeamName(teamAElement);
        const teamAImage = getTeamImage(teamAElement);
        const teamACountryImage = '';
        const teamBName = getTeamName(teamBElement);
        const teamBImage = getTeamImage(teamBElement);
        const teamBCountryImage = '';

        const gameInfo: Game = {
          game: 'csgo',
          gameLink: CSGO_API,
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
          link: ``
        };

        return gameInfo;
      });

    return matchesInfoArr;
  }

  private getR6Matches() {
    const RAINBOW_SIX_SOURCE = 'https://siege.gg';
    const RAINBOW_SIX_SIEGE_MATCHES_PAGE = `${RAINBOW_SIX_SOURCE}/matches`;
    const content = this.getPageContent(RAINBOW_SIX_SIEGE_MATCHES_PAGE);
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
        gameLink: RAINBOW_SIX_SIEGE_MATCHES_PAGE,
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

  private getValorantMatches() {
    const vlrgg = `https://www.vlr.gg`;
    const valorantMatchesPage = `${vlrgg}/matches`;
    const content = this.getPageContent(valorantMatchesPage);
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
        gameLink: valorantMatchesPage,
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
        link: `${vlrgg}${item.attribs.href}`
      };

      return gameInfo;
    });

    return matchesInfoArr;
  }

  /* GET MATCHES FUNCTIONS ================================================== */

  private getAllTodayMatches() {
    const allMatches: Game[] = [];

    if (this.config.games.csgo) {
      allMatches.push(...this.getCsgoMatches());
    }

    if (this.config.games.valorant) {
      allMatches.push(...this.getValorantMatches());
    }

    if (this.config.games.rainbowSixSiege) {
      allMatches.push(...this.getR6Matches());
    }

    if (this.config.games.dota) {
      // allMatches.push(...[]);
    }

    if (this.config.games.lol) {
      // allMatches.push(...[]);
    }

    if (this.config.games.rocketLeague) {
      // allMatches.push(...[]);
    }

    if (this.config.games.overwatch) {
      // allMatches.push(...[]);
    }

    if (this.config.games.callOfDuty) {
      // allMatches.push(...[]);
    }

    if (this.config.games.freeFire) {
      // allMatches.push(...[]);
    }

    this.todayMatches = allMatches;
    return this.todayMatches;
  }

  private getFavoriteTeamsTodayMatches(allMatches: Game[]) {
    const favoriteTeamsMatches = allMatches.filter((item) => item.teams.some((matchTeam) => this.config.favoriteTeams.includes(matchTeam.toLowerCase())));

    this.todayFavoriteTeamsMatches = favoriteTeamsMatches;
    return this.todayFavoriteTeamsMatches;
  }

  /* SEND EMAIL FUNCTIONS =================================================== */

  private generateEmailContent(todayGames: Game[]) {
    let emailHtml = '';

    const tableStyle = `style="border: 1px solid #333; width: 90%"`;
    const tableRowStyle = `style="width: 100%; text-align: center;"`;
    const tableRowColumnStyle = `style="border: 1px solid #333"`;

    // prettier-ignore
    const header = `<tr ${tableRowStyle}">\n
                      <th ${tableRowColumnStyle} width="100px">Time</th>
                      <th ${tableRowColumnStyle} width="100px">Game</th>
                      <th ${tableRowColumnStyle} width="300px">Match</th>\n
                    </tr>`;

    const getTableBodyItemsHtml = () => {
      return todayGames
        .map((item) => {
          // prettier-ignore

          const coloumns = [
            `<div style="text-align: center;"><p>${item.time}</p></div>`,
            `<div style="text-align: center;"><a href="${item.gameLink}">${item.game}</a></div>`,
            `<a href="${item.link}">
              <div style="display: flex; align-items: center; justify-content: center; gap: 150px;">
                <div style="width: 100%;">
                  ${item.teamA.image === '' ? '' : `<img src="${item.teamA.image}" width="20px" height="20px">`}
                  <p>${item.teamA.name}</p>
                </div>
                <div style="width: 100%;">
                  ${item.teamB.image === '' ? '' : `<img src="${item.teamB.image}" width="20px" height="20px">`}
                  <p>${item.teamB.name}</p>
                </div>
              </div>
              <p>${item.event}</p>
            </a>`
          ];
          const row = `<tr ${tableRowStyle}">\n${coloumns.map((it) => `<td ${tableRowColumnStyle}>&nbsp;&nbsp;${it}</td>`).join('\n')}\n</tr>`;
          return row;
        })
        .join('');
    };

    const table = `<center>\n<table ${tableStyle}>\n${header}\n${getTableBodyItemsHtml()}\n</table>\n</center>`;

    emailHtml = emailHtml + `Hi,<br><br>\n`;
    emailHtml = emailHtml + `there are ${todayGames.length} games for today: <br><br>\n`;
    emailHtml = emailHtml + `${table}<br>\n`;
    emailHtml = emailHtml + `Regards, <br>your <a href="https://github.com/${this.GITHUB_REPOSITORY}#readme"><b>${this.APPNAME}</b></a> bot`;

    return emailHtml;
  }

  private sendEmail(favoriteTeamsMatches: Game[]) {
    if (favoriteTeamsMatches.length === 0) {
      return;
    }

    this.logger(`email sent to ${this.USER_EMAIL} to inform about ${favoriteTeamsMatches.length} games`);

    MailApp.sendEmail({
      to: this.USER_EMAIL,
      subject: `${this.APPNAME} - ${favoriteTeamsMatches.length} games for today`,
      htmlBody: this.generateEmailContent(favoriteTeamsMatches)
    });
  }

  /* MAIN FUNCTION ========================================================== */

  checkTodayGames() {
    const allMatches = this.getAllTodayMatches();
    const favoriteTeamsMatches = this.getFavoriteTeamsTodayMatches(allMatches);
    this.sendEmail(favoriteTeamsMatches);
  }
}
