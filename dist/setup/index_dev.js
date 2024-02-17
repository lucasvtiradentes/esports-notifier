function getEsportsNotifierDev(){

    const APP_INFO = {
        name: 'esports notifier',
        github_repository: 'lucasvtiradentes/esports notifier',
        version: '1.2.0',
        build_date_time: '16/02/2024 23:07:26'
    };

    const ERRORS = {
        mustSpecifyConfig: 'You must specify the settings when starting the class',
        timeToSendEmailIncorrect: 'You must specify a correct time string in config.datetime.timeToSendEmail, such as: 07:00'
    };

    function logger(message, newLine) {
        if (newLine === 'before') {
            console.log('');
        }
        console.log(message);
        if (newLine === 'after') {
            console.log('');
        }
    }

    function getDateFixedByTimezone(date, timeZoneIndex) {
        date.setHours(date.getHours() + timeZoneIndex);
        return date;
    }
    function parseHtmlData(content) {
        const cheerioLib = globalThis.Cheerio;
        return cheerioLib.load(content);
    }
    function getPageContent(url) {
        return UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText();
    }

    function getGamesFromLiquipedia(props) {
        const LIQUEDPEDIA_LINK = 'https://liquipedia.net';
        const sourceLink = `${LIQUEDPEDIA_LINK}/${props.pathUrl}`;
        const content = getPageContent(sourceLink);
        const $ = parseHtmlData(content);
        const matchesArr = $('table.infobox_matches_content');
        const getTeamName = (item) => {
            var _a, _b;
            const foundItem = item.children.find((it) => { var _a; return ((_a = it.attribs) === null || _a === void 0 ? void 0 : _a.class.search('team-template-text')) > -1; });
            return (_b = (_a = foundItem === null || foundItem === void 0 ? void 0 : foundItem.children[0]) === null || _a === void 0 ? void 0 : _a.children[0]) === null || _b === void 0 ? void 0 : _b.data;
        };
        const getTeamImage = (item) => {
            var _a, _b, _c;
            const foundItem = item.children.find((it) => { var _a; return ((_a = it.attribs) === null || _a === void 0 ? void 0 : _a.class.search('team-template-image-icon')) > -1; });
            return (_c = (_b = (_a = foundItem === null || foundItem === void 0 ? void 0 : foundItem.children[0]) === null || _a === void 0 ? void 0 : _a.children[0]) === null || _b === void 0 ? void 0 : _b.attribs) === null || _c === void 0 ? void 0 : _c.src;
        };
        const matchesInfoArr = Array.from(matchesArr)
            .filter((item) => item.parent.attribs['data-toggle-area-content'] === '1')
            .map((item) => {
            let dateInfo;
            let eventName;
            let eventTitle;
            let teamAElement;
            let teamBElement;
            if (props.liquipediaPageType === 1) {
                const eventDetailsEl = item.children[1].children[2].children[1].children[1].children[0].children[0];
                eventName = eventDetailsEl.attribs.title;
                eventTitle = eventDetailsEl.attribs.href;
                dateInfo = item.children[1].children[2].children[1].children[0].children[0].children[0].data;
                teamAElement = item.children[1].children[0].children[1].children[0];
                teamBElement = item.children[1].children[0].children[5].children[0];
            }
            if (props.liquipediaPageType === 2) {
                const eventDetailsEl = item.children[1].children[2].children[1].children[1].children[1].children[0];
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
            const dateTime = getDateFixedByTimezone(new Date(dateInfo.replace('- ', '')), props.timezoneCorrection).toISOString();
            const matchDate = dateTime.split('T')[0];
            const matchTime = dateTime.split('T')[1].slice(0, 5);
            const teamAName = getTeamName(teamAElement);
            const teamAImage = getTeamImage(teamAElement);
            const teamACountryImage = '';
            const teamBName = getTeamName(teamBElement);
            const teamBImage = getTeamImage(teamBElement);
            const teamBCountryImage = '';
            const gameInfo = {
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

    function getCallOfDutyMatches(timezoneCorrection) {
        const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'callOfDuty', gameImage: 'https://profile.callofduty.com/resources/cod/images/shared-logo.jpg', pathUrl: 'callofduty/Liquipedia:Upcoming_and_ongoing_matches', liquipediaPageType: 2 });
        logger(`found ${matches.length} cod matches`);
        return matches;
    }

    function getCsgoMatches(timezoneCorrection) {
        const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'csgo', gameImage: 'https://seeklogo.com/images/C/counter-strike-global-offensive-logo-CFCEFBBCE2-seeklogo.com.png', pathUrl: 'counterstrike/Liquipedia:Matches', liquipediaPageType: 1 });
        logger(`found ${matches.length} csgo matches`);
        return matches;
    }

    function getDotaMatches(timezoneCorrection) {
        const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'dota', gameImage: 'https://seeklogo.com/images/D/dota-2-logo-C88DABB066-seeklogo.com.png', pathUrl: 'dota2/Liquipedia:Upcoming_and_ongoing_matches', liquipediaPageType: 2 });
        logger(`found ${matches.length} dota matches`);
        return matches;
    }

    function getLolMatches(timezoneCorrection) {
        const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'leagueOfLegends', gameImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/LoL_icon.svg/256px-LoL_icon.svg.png?20201029024159', pathUrl: 'leagueoflegends/Liquipedia:Matches', liquipediaPageType: 2 });
        logger(`found ${matches.length} lol matches`);
        return matches;
    }

    function getOverwatchMatches(timezoneCorrection) {
        const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'overwatch', gameImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Overwatch_circle_logo.svg/600px-Overwatch_circle_logo.svg.png?20160426111034', pathUrl: 'overwatch/Liquipedia:Upcoming_and_ongoing_matches', liquipediaPageType: 1 });
        logger(`found ${matches.length} overwatch matches`);
        return matches;
    }

    function getR6Matches(timezoneCorrection) {
        const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'rainbowSixSiege', gameImage: 'https://www.clipartmax.com/png/small/308-3080527_0-tom-clancys-rainbow-six-siege.png', pathUrl: 'rainbowsix/Liquipedia:Upcoming_and_ongoing_matches', liquipediaPageType: 2 });
        logger(`found ${matches.length} r6 matches`);
        return matches;
    }

    function getRocketLeagueMatches(timezoneCorrection) {
        const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'rocketLeague', gameImage: 'https://upload.wikimedia.org/wikipedia/he/thumb/6/68/Rocket_league_logo_1.jpeg/675px-Rocket_league_logo_1.jpeg?20210526204716', pathUrl: 'rocketleague/Liquipedia:Matches', liquipediaPageType: 3 });
        logger(`found ${matches.length} rocketLeague matches`);
        return matches;
    }

    function getValorantMatches() {
        const vlrgg = `https://www.vlr.gg`;
        const valorantMatchesPage = `${vlrgg}/matches`;
        const content = getPageContent(valorantMatchesPage);
        const $ = parseHtmlData(content);
        const valorantMatches = $('a.match-item');
        const getParsedTime = (item) => {
            const [time, turn] = item.split(' ');
            const timeArr = time.split(':');
            const hourFixedByTurn = turn === 'AM' ? Number(timeArr[0]) : Number(timeArr[0]) + 12;
            const hourFixedByVlrggTime = hourFixedByTurn + 2;
            const finalTime = `${hourFixedByVlrggTime}:${timeArr[1]}`;
            return finalTime.length === 4 ? `0${finalTime}` : finalTime;
        };
        const matchesInfoArr = Array.from(valorantMatches).map((item) => {
            const matchDate = new Date(item.parent.prev.prev.children[0].data.trim()).toISOString().split('T')[0];
            const matchTime = getParsedTime(item.children[0].next.children[0].data.trim());
            const event = item.children[13].children[2].data.trim();
            const teamAName = item.children[3].children[1].children[1].children[1].children[2].data.trim();
            const teamAImage = '';
            const teamACountryImage = item.children[3].children[1].children[1].children[1].children[1].attribs.class.replace('flag ', '');
            const teamBName = item.children[3].children[3].children[1].children[1].children[2].data.trim();
            const teamBImage = '';
            const teamBCountryImage = item.children[3].children[3].children[1].children[1].children[1].attribs.class.replace('flag ', '');
            const gameInfo = {
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
        logger(`found ${matchesInfoArr.length} valorant matches`);
        return matchesInfoArr;
    }

    function sortGamesByDatetime(arr) {
        return arr.sort((a, b) => Number(new Date(`${a.date}T${a.time}`)) - Number(new Date(`${b.date}T${b.time}`)));
    }
    function getAllTodayMatches(config) {
        const allMatches = [];
        if (config.esports.games.callOfDuty.sync) {
            allMatches.push(...getCallOfDutyMatches(config.datetime.diffHoursFromGmtTimezone));
        }
        if (config.esports.games.dota.sync) {
            allMatches.push(...getDotaMatches(config.datetime.diffHoursFromGmtTimezone));
        }
        if (config.esports.games.rocketLeague.sync) {
            allMatches.push(...getRocketLeagueMatches(config.datetime.diffHoursFromGmtTimezone));
        }
        if (config.esports.games.overwatch.sync) {
            allMatches.push(...getOverwatchMatches(config.datetime.diffHoursFromGmtTimezone));
        }
        if (config.esports.games.leagueOfLegends.sync) {
            allMatches.push(...getLolMatches(config.datetime.diffHoursFromGmtTimezone));
        }
        if (config.esports.games.csgo.sync) {
            allMatches.push(...getCsgoMatches(config.datetime.diffHoursFromGmtTimezone));
        }
        if (config.esports.games.valorant.sync) {
            allMatches.push(...getValorantMatches());
        }
        if (config.esports.games.rainbowSixSiege.sync) {
            allMatches.push(...getR6Matches(config.datetime.diffHoursFromGmtTimezone));
        }
        const todayMatches = sortGamesByDatetime(allMatches);
        logger(`there were found ${todayMatches.length} matches across all selected games`, 'before');
        return todayMatches;
    }
    function getFavoriteTeamsMatches(allMatches, config) {
        let filteredMatches = [];
        filteredMatches = allMatches.filter((item) => {
            const lowerCaseMatchTeams = item.teams.map((team) => team.toLowerCase());
            const lowercaseFavoriteTeams = config.esports.favoriteTeams.map((team) => team.toLowerCase());
            let isGlobalFavoriteTeam = false;
            if (config.settings.strictTeamComparasion) {
                isGlobalFavoriteTeam = lowerCaseMatchTeams.some((matchTeam) => lowercaseFavoriteTeams.includes(matchTeam.toLowerCase()));
            }
            else {
                isGlobalFavoriteTeam = lowerCaseMatchTeams.some((matchTeam) => lowercaseFavoriteTeams.filter((favTeam) => matchTeam.search(favTeam) > -1).length > 0);
            }
            let isGameFavoriteTeam = false;
            const gameOptions = config.esports.games[item.game.name];
            const lowerCaseGameTeams = gameOptions.teams.map((team) => team.toLowerCase());
            if (config.settings.strictTeamComparasion) {
                isGameFavoriteTeam = lowerCaseMatchTeams.some((matchTeam) => lowerCaseGameTeams.includes(matchTeam.toLowerCase()));
            }
            else {
                isGameFavoriteTeam = lowerCaseMatchTeams.some((matchTeam) => lowerCaseGameTeams.filter((favTeam) => matchTeam.search(favTeam) > -1).length > 0);
            }
            return isGlobalFavoriteTeam || isGameFavoriteTeam;
        });
        const todayFavoriteTeamsMatches = sortGamesByDatetime(filteredMatches);
        logger(`there were found ${todayFavoriteTeamsMatches.length} of your favorite teams in the next coulpe of days`);
        return todayFavoriteTeamsMatches;
    }

    function generateEmailContent(gamesToInform, extendedConfigs) {
        let emailHtml = '';
        const tableStyle = `border: 1px solid #333; width: 90%`;
        const rowStyle = `text-align: center;`;
        const columnStyle = `border: 1px solid #333; white-space: nowrap;`;
        // prettier-ignore
        const header = `<tr style="${rowStyle}">
                      <th style="${columnStyle}">Time</th>
                      <th style="${columnStyle}">Match</th>
                      <th style="${columnStyle}">TMatchInfo</th>
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
                                ${extendedConfigs.configs.settings.notifyOnlyAboutTodayGames ? `<p style="white-space: nowrap;">${item.time}</p>` : `<p style="white-space: nowrap;">${item.date === extendedConfigs.today_date ? `<span style="color: red;">${item.date}</span>` : item.date}</p><p style="white-space: nowrap;">${item.time}</p>`}
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
        emailHtml = emailHtml + `there ${gamesToInform.length === 1 ? 'is' : 'are'} <b>${gamesToInform.length} ${gamesToInform.length === 1 ? 'game' : 'games'}</b> of your favorite teams ${extendedConfigs.configs.settings.notifyOnlyAboutTodayGames ? 'today' : 'soon'}: <br><br>\n`;
        emailHtml = emailHtml + `${table}<br>\n`;
        emailHtml = emailHtml + `Regards, <br>your <a href="https://github.com/${APP_INFO.github_repository}#readme"><b>${APP_INFO.name}</b></a> bot`;
        return emailHtml;
    }
    function sendEmail(favoriteTeamsMatches, extendedConfig) {
        if (favoriteTeamsMatches.length === 0) {
            return;
        }
        logger(`email sent to ${extendedConfig.user_email} to inform about ${favoriteTeamsMatches.length} games`);
        MailApp.sendEmail({
            to: extendedConfig.user_email,
            subject: `${APP_INFO.name} - ${favoriteTeamsMatches.length} ${favoriteTeamsMatches.length === 1 ? 'game' : 'games'} of your favorite teams ${extendedConfig.configs.settings.notifyOnlyAboutTodayGames ? `today - ${extendedConfig.today_date}` : 'soon'}`,
            htmlBody: generateEmailContent(favoriteTeamsMatches, extendedConfig)
        });
    }

    function validateConfigs(config) {
        var _a;
        if (!config) {
            throw new Error(ERRORS.mustSpecifyConfig);
        }
        const validationArr = [
            { objToCheck: config, requiredKeys: ['esports', 'datetime', 'settings'], name: 'configs' },
            { objToCheck: config === null || config === void 0 ? void 0 : config.esports, requiredKeys: ['favoriteTeams', 'games'], name: 'configs.esports' },
            { objToCheck: (_a = config === null || config === void 0 ? void 0 : config.esports) === null || _a === void 0 ? void 0 : _a.games, requiredKeys: ['csgo', 'valorant', 'rainbowSixSiege', 'leagueOfLegends'], name: 'configs.esports.games' },
            { objToCheck: config === null || config === void 0 ? void 0 : config.datetime, requiredKeys: ['diffHoursFromGmtTimezone', 'timeToSendEmail'], name: 'configs.datetime' },
            { objToCheck: config === null || config === void 0 ? void 0 : config.settings, requiredKeys: ['notifyOnlyAboutTodayGames', 'strictTeamComparasion', 'maintanceMode', 'loopFunction'], name: 'configs.settings' }
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

    class EsportsNotifier {
        constructor(config) {
            this.extended_configs = {
                configs: null,
                today_date: '',
                user_email: '',
                environment: typeof UrlFetchApp === 'undefined' ? 'development' : 'production'
            };
            validateConfigs(config);
            this.extended_configs.configs = config;
            this.extended_configs.today_date = getDateFixedByTimezone(new Date(), config.datetime.diffHoursFromGmtTimezone).toISOString().split('T')[0];
            this.extended_configs.user_email = this.extended_configs.environment === 'production' ? Session.getActiveUser().getEmail() : '';
            logger(`${APP_INFO.name} is running at version ${APP_INFO.version} in ${this.extended_configs.environment} environment`);
            logger(`check the docs for your version here: ${`https://github.com/${APP_INFO.github_repository}/tree/v${APP_INFO.version}#readme`}`);
        }
        /* MAIN FUNCTION ========================================================== */
        install() {
            logger(`install ${APP_INFO.name}`);
            const timeArr = this.extended_configs.configs.datetime.timeToSendEmail.split(':');
            if (timeArr.length !== 2) {
                throw new Error(ERRORS.timeToSendEmailIncorrect);
            }
            const tickSyncTrigger = ScriptApp.getProjectTriggers().find((item) => item.getHandlerFunction() === this.extended_configs.configs.settings.loopFunction);
            if (tickSyncTrigger) {
                logger(`removed old trigger of function ${this.extended_configs.configs.settings.loopFunction}`);
                ScriptApp.deleteTrigger(tickSyncTrigger);
            }
            logger(`the loop function ${this.extended_configs.configs.settings.loopFunction} will be triggered everyday at ${this.extended_configs.configs.datetime.timeToSendEmail}`);
            ScriptApp.newTrigger(this.extended_configs.configs.settings.loopFunction)
                .timeBased()
                .everyDays(1)
                .atHour(Number(timeArr[0]) - this.extended_configs.configs.datetime.diffHoursFromGmtTimezone)
                .nearMinute(Number(timeArr[1]))
                .create();
        }
        uninstall() {
            logger(`uninstall ${APP_INFO.name}`);
            const tickSyncTrigger = ScriptApp.getProjectTriggers().find((item) => item.getHandlerFunction() === this.extended_configs.configs.settings.loopFunction);
            if (tickSyncTrigger) {
                ScriptApp.deleteTrigger(tickSyncTrigger);
            }
        }
        checkTodayGames() {
            const allMatches = getAllTodayMatches(this.extended_configs.configs);
            const favoriteTeamsMatches = getFavoriteTeamsMatches(allMatches, this.extended_configs.configs);
            const onlyTodayMatches = favoriteTeamsMatches.filter((game) => game.date === this.extended_configs.today_date);
            logger(`there were found ${onlyTodayMatches.length} of your favorite teams today`, 'after');
            const matchesToNotify = this.extended_configs.configs.settings.notifyOnlyAboutTodayGames ? onlyTodayMatches : favoriteTeamsMatches;
            sendEmail(matchesToNotify, this.extended_configs);
        }
    }

    return EsportsNotifier;

}