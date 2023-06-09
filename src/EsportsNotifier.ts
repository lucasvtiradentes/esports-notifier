/* eslint-disable @typescript-eslint/no-explicit-any */

type GameOption = {
  sync: boolean;
  teams: string[];
};

type Config = {
  esports: {
    favoriteTeams: string[];
    games: {
      csgo: GameOption;
      valorant: GameOption;
      rainbowSixSiege: GameOption;
      leagueOfLegends: GameOption;
      overwatch: GameOption;
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

type GameName = keyof Config['esports']['games'];

type MatchInfo = {
  game: {
    name: GameName;
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

type Environment = 'production' | 'development';

type CheerioItem = any;

/* -------------------------------------------------------------------------- */

export default class EsportsNotifier {
  private VERSION = ''; // version
  private APPNAME = 'esports notifier';
  private GITHUB_REPOSITORY = 'lucasvtiradentes/esports-notifier';
  private TODAY_DATE = '';
  private SESSION_LOGS = [];
  private ENVIRONMENT = this.detectEnvironment();
  private USER_EMAIL = this.ENVIRONMENT === 'production' ? this.getUserEmail() : '';
  private ERRORS = {
    mustSpecifyConfig: 'You must specify the settings when starting the class',
    timeToSendEmailIncorrect: 'You must specify a correct time string in config.datetime.timeToSendEmail, such as: 07:00'
  };
  public todayMatches: MatchInfo[] = [];
  public todayFavoriteTeamsMatches: MatchInfo[] = [];

  constructor(private config: Config) {
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
      { objToCheck: config?.esports?.games, requiredKeys: ['csgo', 'valorant', 'rainbowSixSiege', 'leagueOfLegends'], name: 'configs.esports.games' },
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

  private getGamesFromLiquipedia(props: { pathUrl: string; gameName: GameName; gameImage: string; liquipediaPageType: 1 | 2 | 3 }) {
    const LIQUEDPEDIA_LINK = 'https://liquipedia.net';
    const sourceLink = `${LIQUEDPEDIA_LINK}/${props.pathUrl}`;

    const content = this.getPageContent(sourceLink);
    const $ = this.parseHtmlData(content);
    const matchesArr = $('table.infobox_matches_content');

    const getTeamName = (item: CheerioItem) => {
      const foundItem = item.children.find((it: CheerioItem) => it.attribs?.class.search('team-template-text') > -1);
      return foundItem?.children[0]?.children[0]?.data;
    };

    const getTeamImage = (item: CheerioItem) => {
      const foundItem = item.children.find((it) => it.attribs?.class.search('team-template-image-icon') > -1);
      return foundItem?.children[0]?.children[0]?.attribs?.src;
    };

    const matchesInfoArr = Array.from(matchesArr)
      .filter((item: CheerioItem) => item.parent.attribs['data-toggle-area-content'] === '1')
      .map((item: CheerioItem) => {
        let dateInfo: CheerioItem;
        let eventName: string;
        let eventTitle: string;
        let teamAElement: CheerioItem;
        let teamBElement: CheerioItem;

        if (props.liquipediaPageType === 1) {
          const eventDetailsEl: CheerioItem = item.children[1].children[2].children[1].children[1].children[0].children[0];
          eventName = eventDetailsEl.attribs.title;
          eventTitle = eventDetailsEl.attribs.href;
          dateInfo = item.children[1].children[2].children[1].children[0].children[0].children[0].data;
          teamAElement = item.children[1].children[0].children[1].children[0];
          teamBElement = item.children[1].children[0].children[5].children[0];
        }

        if (props.liquipediaPageType === 2) {
          const eventDetailsEl: CheerioItem = item.children[1].children[2].children[1].children[1].children[1].children[0];
          eventName = eventDetailsEl.attribs.title;
          eventTitle = eventDetailsEl.attribs.href;
          dateInfo = item.children[1].children[2].children[1].children[0].children[0].children[0].data;
          teamAElement = item.children[1].children[0].children[1].children[0];
          teamBElement = item.children[1].children[0].children[5].children[0];
        }

        if (props.liquipediaPageType === 3) {
          const eventDetailsEl = item.children[0].children[1].children[0].children[1].children[0].children[0].children[0];
          eventName = eventDetailsEl.attribs.title;
          eventTitle = eventDetailsEl.attribs.href;
          dateInfo = item.children[0].children[1].children[0].children[0].children[0].children[0].data;
          teamAElement = item.children[0].children[0].children[0].children[0];
          teamBElement = item.children[0].children[0].children[2].children[0];
        }

        const dateTime = this.getDateFixedByTimezone(new Date(dateInfo.replace('- ', '')), this.config.datetime.diffHoursFromGmtTimezone).toISOString();
        const matchDate = dateTime.split('T')[0];
        const matchTime = dateTime.split('T')[1].slice(0, 5);
        const teamAName = getTeamName(teamAElement);
        const teamAImage = getTeamImage(teamAElement);
        const teamACountryImage = '';
        const teamBName = getTeamName(teamBElement);
        const teamBImage = getTeamImage(teamBElement);
        const teamBCountryImage = '';

        const gameInfo: MatchInfo = {
          game: {
            name: props.gameName,
            image: props.gameImage,
            link: sourceLink
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
          event: eventName,
          eventLink: `${LIQUEDPEDIA_LINK}${eventTitle}`,
          link: ``
        };

        return gameInfo;
      });

    return matchesInfoArr;
  }

  private getCallOfDutyMatches() {
    const matches = this.getGamesFromLiquipedia({ gameName: 'callOfDuty', gameImage: 'https://profile.callofduty.com/resources/cod/images/shared-logo.jpg', pathUrl: 'callofduty/Liquipedia:Upcoming_and_ongoing_matches', liquipediaPageType: 2 });
    this.logger(`found ${matches.length} cod matches`);
    return matches;
  }

  private getDotaMatches() {
    const matches = this.getGamesFromLiquipedia({ gameName: 'dota', gameImage: 'https://seeklogo.com/images/D/dota-2-logo-C88DABB066-seeklogo.com.png', pathUrl: 'dota2/Liquipedia:Upcoming_and_ongoing_matches', liquipediaPageType: 2 });
    this.logger(`found ${matches.length} dota matches`);
    return matches;
  }

  private getRocketLeagueMatches() {
    const matches = this.getGamesFromLiquipedia({ gameName: 'rocketLeague', gameImage: 'https://upload.wikimedia.org/wikipedia/he/thumb/6/68/Rocket_league_logo_1.jpeg/675px-Rocket_league_logo_1.jpeg?20210526204716', pathUrl: 'rocketleague/Liquipedia:Matches', liquipediaPageType: 3 });
    this.logger(`found ${matches.length} rocketLeague matches`);
    return matches;
  }

  private getOverwatchMatches() {
    const matches = this.getGamesFromLiquipedia({ gameName: 'overwatch', gameImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Overwatch_circle_logo.svg/600px-Overwatch_circle_logo.svg.png?20160426111034', pathUrl: 'overwatch/Liquipedia:Upcoming_and_ongoing_matches', liquipediaPageType: 1 });
    this.logger(`found ${matches.length} overwatch matches`);
    return matches;
  }

  private getLolMatches() {
    const matches = this.getGamesFromLiquipedia({ gameName: 'leagueOfLegends', gameImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/LoL_icon.svg/256px-LoL_icon.svg.png?20201029024159', pathUrl: 'leagueoflegends/Liquipedia:Matches', liquipediaPageType: 2 });
    this.logger(`found ${matches.length} lol matches`);
    return matches;
  }

  private getCsgoMatches() {
    const matches = this.getGamesFromLiquipedia({ gameName: 'csgo', gameImage: 'https://seeklogo.com/images/C/counter-strike-global-offensive-logo-CFCEFBBCE2-seeklogo.com.png', pathUrl: 'counterstrike/Liquipedia:Matches', liquipediaPageType: 1 });
    this.logger(`found ${matches.length} csgo matches`);
    return matches;
  }

  private getR6Matches() {
    const matches = this.getGamesFromLiquipedia({ gameName: 'rainbowSixSiege', gameImage: 'https://www.clipartmax.com/png/small/308-3080527_0-tom-clancys-rainbow-six-siege.png', pathUrl: 'rainbowsix/Liquipedia:Upcoming_and_ongoing_matches', liquipediaPageType: 2 });
    this.logger(`found ${matches.length} r6 matches`);
    return matches;
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

      const gameInfo: MatchInfo = {
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
        eventLink: '',
        link: `${vlrgg}${item.attribs.href}`
      };

      return gameInfo;
    });

    this.logger(`found ${matchesInfoArr.length} valorant matches`);
    return matchesInfoArr;
  }

  /* GET MATCHES FUNCTIONS ================================================== */

  private sortGamesByDatetime(arr: MatchInfo[]) {
    return arr.sort((a, b) => Number(new Date(`${a.date}T${a.time}`)) - Number(new Date(`${b.date}T${b.time}`)));
  }

  private getAllTodayMatches() {
    const allMatches: MatchInfo[] = [];

    if (this.config.esports.games.callOfDuty.sync) {
      allMatches.push(...this.getCallOfDutyMatches());
    }

    if (this.config.esports.games.dota.sync) {
      allMatches.push(...this.getDotaMatches());
    }

    if (this.config.esports.games.rocketLeague.sync) {
      allMatches.push(...this.getRocketLeagueMatches());
    }

    if (this.config.esports.games.overwatch.sync) {
      allMatches.push(...this.getOverwatchMatches());
    }

    if (this.config.esports.games.leagueOfLegends.sync) {
      allMatches.push(...this.getLolMatches());
    }

    if (this.config.esports.games.csgo.sync) {
      allMatches.push(...this.getCsgoMatches());
    }

    if (this.config.esports.games.valorant.sync) {
      allMatches.push(...this.getValorantMatches());
    }

    if (this.config.esports.games.rainbowSixSiege.sync) {
      allMatches.push(...this.getR6Matches());
    }

    this.todayMatches = this.sortGamesByDatetime(allMatches);
    this.logger(`there were found ${this.todayMatches.length} matches across all selected games`, 'before');

    return this.todayMatches;
  }

  private getFavoriteTeamsMatches(allMatches: MatchInfo[]) {
    let filteredMatches: MatchInfo[] = [];

    filteredMatches = allMatches.filter((item) => {
      const lowerCaseMatchTeams = item.teams.map((team) => team.toLowerCase());

      const lowercaseFavoriteTeams = this.config.esports.favoriteTeams.map((team) => team.toLowerCase());
      let isGlobalFavoriteTeam = false;
      if (this.config.settings.strictTeamComparasion) {
        isGlobalFavoriteTeam = lowerCaseMatchTeams.some((matchTeam) => lowercaseFavoriteTeams.includes(matchTeam.toLowerCase()));
      } else {
        isGlobalFavoriteTeam = lowerCaseMatchTeams.some((matchTeam) => lowercaseFavoriteTeams.filter((favTeam) => matchTeam.search(favTeam) > -1).length > 0);
      }

      let isGameFavoriteTeam = false;
      const gameOptions = this.config.esports.games[item.game.name];
      const lowerCaseGameTeams = gameOptions.teams.map((team) => team.toLowerCase());

      if (this.config.settings.strictTeamComparasion) {
        isGameFavoriteTeam = lowerCaseMatchTeams.some((matchTeam) => lowerCaseGameTeams.includes(matchTeam.toLowerCase()));
      } else {
        isGameFavoriteTeam = lowerCaseMatchTeams.some((matchTeam) => lowerCaseGameTeams.filter((favTeam) => matchTeam.search(favTeam) > -1).length > 0);
      }

      return isGlobalFavoriteTeam || isGameFavoriteTeam;
    });

    this.todayFavoriteTeamsMatches = this.sortGamesByDatetime(filteredMatches);
    this.logger(`there were found ${this.todayFavoriteTeamsMatches.length} of your favorite teams in the next coulpe of days`);

    return this.todayFavoriteTeamsMatches;
  }

  /* SEND EMAIL FUNCTIONS =================================================== */

  private generateEmailContent(gamesToInform: MatchInfo[]) {
    let emailHtml = '';

    const tableStyle = `border: 1px solid #333; width: 90%`;
    const rowStyle = `text-align: center;`;
    const columnStyle = `border: 1px solid #333; white-space: nowrap;`;

    // prettier-ignore
    const header = `<tr style="${rowStyle}">
                      <th style="${columnStyle}">Time</th>
                      <th style="${columnStyle}">Match</th>
                      <th style="${columnStyle}">MatchInfo</th>
                    </tr>`;

    const getTableBodyItemsHtml = () => {
      return gamesToInform
        .map((item) => {
          const teamAImage = item.teamA.image || item.teamA.countryImage || '';
          const teamBImage = item.teamB.image || item.teamB.countryImage || '';

          // prettier-ignore
          const itemRow = `<tr style="${rowStyle}">
                            <td style="${columnStyle}">
                              <div style="text-align: center;">
                                ${this.config.settings.notifyOnlyAboutTodayGames ? `<p style="white-space: nowrap;">${item.time}</p>` : `<p style="white-space: nowrap;">${item.date === this.TODAY_DATE ? `<span style="color: red;">${item.date}</span>` : item.date}</p><p style="white-space: nowrap;">${item.time}</p>`}
                              </div>
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
                              ${item.eventLink !== '' ? `<a href="${item.eventLink}" style="word-wrap: break-word;">${item.event}</a>` : `<span style="word-wrap: break-word;">${item.event}</span>`}
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

  private sendEmail(favoriteTeamsMatches: MatchInfo[]) {
    if (favoriteTeamsMatches.length === 0) {
      return;
    }

    this.logger(`email sent to ${this.USER_EMAIL} to inform about ${favoriteTeamsMatches.length} games`);

    MailApp.sendEmail({
      to: this.USER_EMAIL,
      subject: `${this.APPNAME} - ${favoriteTeamsMatches.length} ${favoriteTeamsMatches.length === 1 ? 'game' : 'games'} of your favorite teams ${this.config.settings.notifyOnlyAboutTodayGames ? `today - ${this.TODAY_DATE}` : 'soon'}`,
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
