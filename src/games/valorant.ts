import { TCheerioItem, TMatchInfo } from '../consts/types';
import { logger } from '../utils/logger';
import { getPageContent, parseHtmlData } from '../utils/utils';

export function getValorantMatches() {
  const vlrgg = `https://www.vlr.gg`;
  const valorantMatchesPage = `${vlrgg}/matches`;
  const content = getPageContent(valorantMatchesPage);
  const $ = parseHtmlData(content);

  const valorantMatches = $('a.match-item');

  const getParsedTime = (item: string) => {
    const [time, turn] = item.split(' ');
    const timeArr = time.split(':');
    const hourFixedByTurn = turn === 'AM' ? Number(timeArr[0]) : Number(timeArr[0]) + 12;
    const hourFixedByVlrggTime = hourFixedByTurn + 2;
    const finalTime = `${hourFixedByVlrggTime}:${timeArr[1]}`;
    return finalTime.length === 4 ? `0${finalTime}` : finalTime;
  };

  const matchesInfoArr = Array.from(valorantMatches).map((item: TCheerioItem) => {
    const matchDate = new Date(item.parent.prev.prev.children[0].data.trim()).toISOString().split('T')[0];
    const matchTime = getParsedTime(item.children[0].next.children[0].data.trim());
    const event = item.children[13].children[2].data.trim();
    const teamAName = item.children[3].children[1].children[1].children[1].children[2].data.trim();
    const teamAImage = '';
    const teamACountryImage = item.children[3].children[1].children[1].children[1].children[1].attribs.class.replace('flag ', '');
    const teamBName = item.children[3].children[3].children[1].children[1].children[2].data.trim();
    const teamBImage = '';
    const teamBCountryImage = item.children[3].children[3].children[1].children[1].children[1].attribs.class.replace('flag ', '');

    const gameInfo: TMatchInfo = {
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
