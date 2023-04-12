/* eslint-disable @typescript-eslint/no-explicit-any */

type Config = {
  esports: {
    favoriteTeams: string[];
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

type Games = keyof Config['esports']['games'];

type Game = {
  game: {
    name: Games;
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
  link: string;
};

type Environment = 'production' | 'development';

type CheerioItem = any;

/* -------------------------------------------------------------------------- */

export default class EsportsNotifier {
  VERSION = ''; // version
  APPNAME = 'esports notifier';
  GITHUB_REPOSITORY = 'lucasvtiradentes/esports-notifier';
  TODAY_DATE = '';
  SESSION_LOGS = [];
  ENVIRONMENT = this.detectEnvironment();
  USER_EMAIL = this.ENVIRONMENT === 'production' ? this.getUserEmail() : '';
  ERRORS = {
    mustSpecifyConfig: 'You must specify the settings when starting the class',
    timeToSendEmailIncorrect: 'You must specify a correct time string in config.datetime.timeToSendEmail, such as: 07:00'
  };
  public todayMatches: Game[] = [];
  public todayFavoriteTeamsMatches: Game[] = [];

  constructor(public config: Config) {
    this.validateConfigs(config);
    this.config = config;
    this.TODAY_DATE = this.getDateFixedByTimezone(new Date(), this.config.datetime.diffHoursFromGmtTimezone).toISOString().split('T')[0];

    this.logger(`${this.APPNAME} is running at version ${this.VERSION} in ${this.ENVIRONMENT} environment`);
    this.logger(`check the docs for your version here: ${`https://github.com/${this.GITHUB_REPOSITORY}/tree/v${this.VERSION}#readme`}`);
  }

  private validateConfigs(config: Config) {
    if (!config) {
      throw new Error(this.ERRORS.mustSpecifyConfig);
    }

    const validationArr = [
      { objToCheck: config, requiredKeys: ['esports', 'datetime', 'settings'], name: 'configs' },
      { objToCheck: config?.esports, requiredKeys: ['favoriteTeams', 'games'], name: 'configs.esports' },
      { objToCheck: config?.esports?.games, requiredKeys: ['csgo', 'valorant', 'rainbowSixSiege', 'dota', 'lol', 'rocketLeague', 'overwatch', 'callOfDuty', 'freeFire'], name: 'configs.esports.games' },
      { objToCheck: config?.datetime, requiredKeys: ['diffHoursFromGmtTimezone', 'timeToSendEmail'], name: 'configs.datetime' },
      { objToCheck: config?.settings, requiredKeys: ['notifyOnlyAboutTodayGames', 'strictTeamComparasion', 'maintanceMode', 'loopFunction'], name: 'configs.settings' }
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

  private logger(message: string, newLine?: 'before' | 'after') {
    this.SESSION_LOGS.push(message);

    if (newLine === 'before') {
      console.log('');
    }

    console.log(message);

    if (newLine === 'after') {
      console.log('');
    }
  }

  /* HELPER FUNCTIONS ======================================================= */

  private getDateFixedByTimezone(date: Date, timeZoneIndex: number) {
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
        const dateTime = this.getDateFixedByTimezone(new Date(item.children[1].children[2].children[1].children[0].children[0].children[0].data.replace('- ', '')), this.config.datetime.diffHoursFromGmtTimezone).toISOString();
        const teamAElement = item.children[1].children[0].children[1].children[0];
        const teamBElement = item.children[1].children[0].children[5].children[0];
        const matchDate = dateTime.split('T')[0];
        const matchTime = dateTime.split('T')[1].slice(0, 5);
        const event = item.children[1].children[2].children[1].children[1].children[0].children[0].children[0].data;
        const teamAName = getTeamName(teamAElement);
        const teamAImage = getTeamImage(teamAElement);
        const teamACountryImage = '';
        const teamBName = getTeamName(teamBElement);
        const teamBImage = getTeamImage(teamBElement);
        const teamBCountryImage = '';

        const gameInfo: Game = {
          game: {
            name: 'csgo',
            image: 'https://seeklogo.com/images/C/counter-strike-global-offensive-logo-CFCEFBBCE2-seeklogo.com.png',
            link: CSGO_API
          },
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

    this.logger(`found ${matchesInfoArr.length} csgo matches`);

    return matchesInfoArr;
  }

  private getR6Matches() {
    const RAINBOW_SIX_SOURCE = 'https://siege.gg';
    const RAINBOW_SIX_SIEGE_MATCHES_PAGE = `${RAINBOW_SIX_SOURCE}/matches`;
    const content = this.getPageContent(RAINBOW_SIX_SIEGE_MATCHES_PAGE);
    const $ = this.parseHtmlData(content);

    const r6Matches = $('a.match--awaiting-results'); // match--has-results
    const matchesInfoArr = Array.from(r6Matches).map((item: CheerioItem) => {
      const dateTimeFixedStr = this.getDateFixedByTimezone(new Date(item.children[0].attribs['data-time']), this.config.datetime.diffHoursFromGmtTimezone).toISOString();

      const matchDate = dateTimeFixedStr.split('T')[0];
      const matchTime = dateTimeFixedStr.split('T')[1].slice(0, 5);
      const event = item.children[0].children[2].children[0].data;
      const link = item.attribs.href;
      const teamAName = item.children[1].children[0].children[0].children[2].children[0].data.trim();
      const teamAImage = item.children[1].children[0].children[0].children[0].attribs.src;
      const teamACountryImage = item.children[1].children[0].children[0].children[1].children[0].attribs.src;
      const teamBName = item.children[1].children[2].children[0].children[2].children[0].data.trim();
      const teamBImage = item.children[1].children[2].children[0].children[0].attribs.src;
      const teamBCountryImage = item.children[1].children[2].children[0].children[1].children[0].attribs.src;

      const gameInfo: Game = {
        game: {
          name: 'rainbowSixSiege',
          image: 'https://www.clipartmax.com/png/small/308-3080527_0-tom-clancys-rainbow-six-siege.png',
          link: RAINBOW_SIX_SIEGE_MATCHES_PAGE
        },
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

    this.logger(`found ${matchesInfoArr.length} rainbowSixSiege matches`);
    return matchesInfoArr;
  }

  private getValorantMatches() {
    const vlrgg = `https://www.vlr.gg`;
    const valorantMatchesPage = `${vlrgg}/matches`;
    const content = this.getPageContent(valorantMatchesPage);
    const $ = this.parseHtmlData(content);

    const valorantMatches = $('a.match-item');

    const getParsedTime = (item: string) => {
      const [time, turn] = item.split(' ');
      const timeArr = time.split(':');
      const hourFixedByTurn = turn === 'AM' ? Number(timeArr[0]) : Number(timeArr[0]) + 12;
      const hourFixedByVlrggTime = hourFixedByTurn + 2;
      const finalTime = `${hourFixedByVlrggTime}:${timeArr[1]}`;
      return finalTime.length === 4 ? `0${finalTime}` : finalTime;
    };

    const matchesInfoArr = Array.from(valorantMatches).map((item: CheerioItem) => {
      const matchDate = new Date(item.parent.prev.prev.children[0].data.trim()).toISOString().split('T')[0];
      const matchTime = getParsedTime(item.children[0].next.children[0].data.trim());
      const event = item.children[13].children[2].data.trim();
      const teamAName = item.children[3].children[1].children[1].children[1].children[2].data.trim();
      const teamAImage = '';
      const teamACountryImage = item.children[3].children[1].children[1].children[1].children[1].attribs.class.replace('flag ', '');
      const teamBName = item.children[3].children[3].children[1].children[1].children[2].data.trim();
      const teamBImage = '';
      const teamBCountryImage = item.children[3].children[3].children[1].children[1].children[1].attribs.class.replace('flag ', '');

      const gameInfo: Game = {
        game: {
          name: 'valorant',
          image: 'https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png',
          link: valorantMatchesPage
        },
        teamA: {
          name: teamAName,
          image: teamAImage,
          countryImage: `${vlrgg}/img/icons/flags/16/${teamACountryImage.replace('mod-', '')}.png`
        },
        teamB: {
          name: teamBName,
          image: teamBImage,
          countryImage: `${vlrgg}/img/icons/flags/16/${teamBCountryImage.replace('mod-', '')}.png`
        },
        teams: [teamAName, teamBName],
        date: matchDate,
        time: matchTime,
        event: event,
        link: `${vlrgg}${item.attribs.href}`
      };

      return gameInfo;
    });

    this.logger(`found ${matchesInfoArr.length} valorant matches`);
    return matchesInfoArr;
  }

  /* GET MATCHES FUNCTIONS ================================================== */

  private getAllTodayMatches() {
    const allMatches: Game[] = [];

    if (this.config.esports.games.csgo) {
      allMatches.push(...this.getCsgoMatches());
    }

    if (this.config.esports.games.valorant) {
      allMatches.push(...this.getValorantMatches());
    }

    if (this.config.esports.games.rainbowSixSiege) {
      allMatches.push(...this.getR6Matches());
    }

    if (this.config.esports.games.dota) {
      // allMatches.push(...[]);
    }

    if (this.config.esports.games.lol) {
      // allMatches.push(...[]);
    }

    if (this.config.esports.games.rocketLeague) {
      // allMatches.push(...[]);
    }

    if (this.config.esports.games.overwatch) {
      // allMatches.push(...[]);
    }

    if (this.config.esports.games.callOfDuty) {
      // allMatches.push(...[]);
    }

    if (this.config.esports.games.freeFire) {
      // allMatches.push(...[]);
    }

    this.todayMatches = allMatches.sort((a, b) => Number(new Date(`${a.date}T${a.time}`)) - Number(new Date(`${b.date}T${b.time}`)));
    this.logger(`there were found ${this.todayMatches.length} matches across all selected games`, 'before');

    return this.todayMatches;
  }

  private getFavoriteTeamsMatches(allMatches: Game[]) {
    const lowercaseFavoriteTeams = this.config.esports.favoriteTeams.map((team) => team.toLowerCase());

    const favoriteTeamsMatches = allMatches.filter((item) => {
      const lowerCaseMatchTeams = item.teams.map((team) => team.toLowerCase());
      if (this.config.settings.strictTeamComparasion) {
        return lowerCaseMatchTeams.some((matchTeam) => lowercaseFavoriteTeams.includes(matchTeam.toLowerCase()));
      } else {
        return lowerCaseMatchTeams.some((matchTeam) => lowercaseFavoriteTeams.filter((favTeam) => matchTeam.search(favTeam) > -1).length > 0);
      }
    });

    this.todayFavoriteTeamsMatches = favoriteTeamsMatches;
    this.logger(`there were found ${this.todayFavoriteTeamsMatches.length} of your favorite teams in the next coulpe of days`);

    return this.todayFavoriteTeamsMatches;
  }

  /* SEND EMAIL FUNCTIONS =================================================== */

  private generateEmailContent(gamesToInform: Game[]) {
    let emailHtml = '';

    const tableStyle = `border: 1px solid #333; width: 90%`;
    const rowStyle = `text-align: center;`;
    const columnStyle = `border: 1px solid #333; white-space: nowrap;`;

    // prettier-ignore
    const header = `<tr style="${rowStyle}">
                      <th style="${columnStyle}">Time</th>
                      <th style="${columnStyle}">Match</th>
                      <th style="${columnStyle}">Game</th>
                    </tr>`;

    const getTableBodyItemsHtml = () => {
      return gamesToInform
        .map((item) => {
          // prettier-ignore

          const teamAImage = item.teamA.image || item.teamA.countryImage || '';
          const teamBImage = item.teamB.image || item.teamB.countryImage || '';

          const itemRow = `<tr style="${rowStyle}">
                            <td style="${columnStyle}">
                              <div style="text-align: center;">${this.config.settings.notifyOnlyAboutTodayGames ? `<p style="white-space: nowrap;">${item.time}</p>` : `<p style="white-space: nowrap;">${item.date}</p><p style="white-space: nowrap;">${item.time}</p>`}</div>
                            </td>
                            <td style="${columnStyle} padding: 10px 0;">
                              <a href="${item.link}">
                                <div style="display: flex; align-items: center; justify-content: center; gap: 100px;">
                                  <div style="width: 100%;">
                                    ${teamAImage === '' ? '' : `<img src="${teamAImage}" width="30px" height="30px"><br>`}
                                    <span>${item.teamA.name}</span>
                                  </div>
                                  <div style="width: 100%;">
                                    ${teamBImage === '' ? '' : `<img src="${teamBImage}" width="30px" height="30px"><br>`}
                                    <span>${item.teamB.name}</span>
                                  </div>
                                  </div>
                              </a>
                              <br>
                              <span style="word-wrap: break-word;">${item.event}</span>
                            </td>
                            <td style="${columnStyle} padding: 10px 0;">
                              <div style="text-align: center;">
                                <a href="${item.game.link}">
                                  <img width="30px" height="30px" src="${item.game.image}"><br>
                                  <span>${item.game.name}</span>
                                </a>
                              </div>
                            </td>
                          </tr>`;
          return itemRow;
        })
        .join('');
    };

    // prettier-ignore
    const table = `<center>
                    <table style="${tableStyle}">
                      <colgroup>
                        <col span="1" style="width: 20%;">
                        <col span="1" style="width: 60%;">
                        <col span="1" style="width: 20%;">
                      </colgroup>
                      <thead>${header}</thead>
                      <tbody>${getTableBodyItemsHtml()}</tbody>
                    </table>
                  </center>`;

    emailHtml = emailHtml + `Hi,<br><br>\n`;
    emailHtml = emailHtml + `there ${gamesToInform.length === 1 ? 'is' : 'are'} <b>${gamesToInform.length} ${gamesToInform.length === 1 ? 'game' : 'games'}</b> of your favorite teams ${this.config.settings.notifyOnlyAboutTodayGames ? 'today' : 'soon'}: <br><br>\n`;
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
      subject: `${this.APPNAME} - ${favoriteTeamsMatches.length} ${favoriteTeamsMatches.length === 1 ? 'game' : 'games'} of your favorite teams ${this.config.settings.notifyOnlyAboutTodayGames ? `${this.TODAY_DATE}` : 'soon'}`,
      htmlBody: this.generateEmailContent(favoriteTeamsMatches)
    });
  }

  /* MAIN FUNCTION ========================================================== */

  install() {
    this.logger(`install ${this.APPNAME}`);
    const timeArr = this.config.datetime.timeToSendEmail.split(':');
    if (timeArr.length !== 2) {
      throw new Error(this.ERRORS.timeToSendEmailIncorrect);
    }

    const tickSyncTrigger = ScriptApp.getProjectTriggers().find((item) => item.getHandlerFunction() === this.config.settings.loopFunction);
    if (tickSyncTrigger) {
      this.logger(`removed old trigger of function ${this.config.settings.loopFunction}`);
      ScriptApp.deleteTrigger(tickSyncTrigger);
    }

    this.logger(`the loop function ${this.config.settings.loopFunction} will be triggered everyday at ${this.config.datetime.timeToSendEmail}`);
    ScriptApp.newTrigger(this.config.settings.loopFunction)
      .timeBased()
      .everyDays(1)
      .atHour(Number(timeArr[0]) - this.config.datetime.diffHoursFromGmtTimezone)
      .nearMinute(Number(timeArr[1]))
      .create();
  }

  uninstall() {
    this.logger(`uninstall ${this.APPNAME}`);
    const tickSyncTrigger = ScriptApp.getProjectTriggers().find((item) => item.getHandlerFunction() === this.config.settings.loopFunction);

    if (tickSyncTrigger) {
      ScriptApp.deleteTrigger(tickSyncTrigger);
    }
  }

  checkTodayGames() {
    const allMatches = this.getAllTodayMatches();
    const favoriteTeamsMatches = this.getFavoriteTeamsMatches(allMatches);
    const onlyTodayMatches = favoriteTeamsMatches.filter((game) => game.date === this.TODAY_DATE);
    this.logger(`there were found ${onlyTodayMatches.length} of your favorite teams today`, 'after');

    const matchesToNotify = this.config.settings.notifyOnlyAboutTodayGames ? onlyTodayMatches : favoriteTeamsMatches;
    this.sendEmail(matchesToNotify);
  }
}
