/* -------------------------------------------------------------------------- */
const CONFIGS = {
    timeToSendEmail: '07:00',
    diffHoursFromUtc: -3,
    favoriteTeams: ['loud', 'mibr', 'imperial', 'syko']
};
function check() {
    const csgoMatches = getCsgoMatches();
    const r6Matches = getR6Matches();
    const valorantMatches = getValorantMatches();
    const allMatches = [...csgoMatches, ...r6Matches, ...valorantMatches];
    const favoriteTeamsMatches = allMatches.filter(item => item.teams.some(matchTeam => CONFIGS.favoriteTeams.includes(matchTeam.toLowerCase())));
    console.log(favoriteTeamsMatches);
    console.log(allMatches.length);
    console.log(favoriteTeamsMatches.length);
}
function parseHtmlData(content) {
    const cheerioLib = globalThis.Cheerio;
    return cheerioLib.load(content);
}
function getCsgoMatches() {
    const LIQUEDPEDIA_LINK = 'https://liquipedia.net';
    const CSGO_API = `${LIQUEDPEDIA_LINK}/counterstrike/Main_Page`;
    const content = UrlFetchApp.fetch(CSGO_API, { muteHttpExceptions: true }).getContentText();
    const $ = parseHtmlData(content);
    const csgoMatches = $('table.infobox_matches_content');
    const getTeamName = (item) => {
        var _a, _b;
        const foundItem = item.children.find(it => { var _a; return ((_a = it.attribs) === null || _a === void 0 ? void 0 : _a.class.search('team-template-text')) > -1; });
        return (_b = (_a = foundItem === null || foundItem === void 0 ? void 0 : foundItem.children[0]) === null || _a === void 0 ? void 0 : _a.children[0]) === null || _b === void 0 ? void 0 : _b.data;
    };
    const getTeamImage = (item) => {
        var _a, _b, _c;
        const foundItem = item.children.find(it => { var _a; return ((_a = it.attribs) === null || _a === void 0 ? void 0 : _a.class.search('team-template-image-icon')) > -1; });
        return (_c = (_b = (_a = foundItem === null || foundItem === void 0 ? void 0 : foundItem.children[0]) === null || _a === void 0 ? void 0 : _a.children[0]) === null || _b === void 0 ? void 0 : _b.attribs) === null || _c === void 0 ? void 0 : _c.src;
    };
    const matchesInfoArr = Array.from(csgoMatches).map((item) => {
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
        const gameInfo = {
            game: 'counter_strike_global_offensive',
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
function getR6Matches() {
    const RAINBOW_SIX_SOURCE = 'https://siege.gg';
    const RAINBOW_SIX_SIEGE_MATCHES_PAGE = `${RAINBOW_SIX_SOURCE}/matches`;
    const content = UrlFetchApp.fetch(RAINBOW_SIX_SIEGE_MATCHES_PAGE, { muteHttpExceptions: true }).getContentText();
    const $ = parseHtmlData(content);
    const r6Matches = $('a.match--awaiting-results'); // match--has-results
    const matchesInfoArr = Array.from(r6Matches).map((item) => {
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
        const gameInfo = {
            game: 'rainbow_six_siege',
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
function getValorantMatches() {
    const VALORANT_API = 'https://www.vlr.gg/matches';
    const content = UrlFetchApp.fetch(VALORANT_API).getContentText();
    const $ = parseHtmlData(content);
    const valorantMatches = $('a.match-item');
    const matchesInfoArr = Array.from(valorantMatches).map((item) => {
        const matchDate = item.parent.prev.prev.children[0].data.trim();
        const matchTime = item.children[0].next.children[0].data.trim();
        const event = item.children[13].children[2].data.trim();
        const teamAName = item.children[3].children[1].children[1].children[1].children[2].data.trim();
        const teamAImage = '';
        const teamACountryImage = item.children[3].children[1].children[1].children[1].children[1].attribs.class.replace('flag ', '');
        const teamBName = item.children[3].children[3].children[1].children[1].children[2].data.trim();
        const teamBImage = '';
        const teamBCountryImage = item.children[3].children[3].children[1].children[1].children[1].attribs.class.replace('flag ', '');
        const gameInfo = {
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
