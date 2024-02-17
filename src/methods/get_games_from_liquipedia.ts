import { TCheerioItem, TGameName, TMatchInfo } from '../consts/types';
import { getDateFixedByTimezone, getPageContent, parseHtmlData } from '../utils/utils';

type TGetGamesFromLiquipedia = {
  pathUrl: string;
  gameName: TGameName;
  gameImage: string;
  liquipediaPageType: 1 | 2 | 3;
  timezoneCorrection: number;
};

export function getGamesFromLiquipedia(props: TGetGamesFromLiquipedia) {
  const LIQUEDPEDIA_LINK = 'https://liquipedia.net';
  const sourceLink = `${LIQUEDPEDIA_LINK}/${props.pathUrl}`;

  const content = getPageContent(sourceLink);
  const $ = parseHtmlData(content);
  const matchesArr = $('table.infobox_matches_content');

  const getTeamName = (item: TCheerioItem) => {
    const foundItem = item.children.find((it: TCheerioItem) => it.attribs?.class.search('team-template-text') > -1);
    return foundItem?.children[0]?.children[0]?.data;
  };

  const getTeamImage = (item: TCheerioItem) => {
    const foundItem = item.children.find((it) => it.attribs?.class.search('team-template-image-icon') > -1);
    return foundItem?.children[0]?.children[0]?.attribs?.src;
  };

  const matchesInfoArr = Array.from(matchesArr)
    .filter((item: TCheerioItem) => item.parent.attribs['data-toggle-area-content'] === '1')
    .map((item: TCheerioItem) => {
      let dateInfo: TCheerioItem;
      let eventName: string;
      let eventTitle: string;
      let teamAElement: TCheerioItem;
      let teamBElement: TCheerioItem;

      if (props.liquipediaPageType === 1) {
        const eventDetailsEl = item.children[1].children[2].children[1].children[0].children[1].children[0].children[0];
        eventName = eventDetailsEl.attribs.title;
        eventTitle = eventDetailsEl.attribs.href;
        dateInfo = item.children[1].children[2].children[1].children[0].children[0].children[0].children[0].children[0].data;
        teamAElement = item.children[1].children[0].children[1].children[0];
        teamBElement = item.children[1].children[0].children[5].children[0];
      }

      if (props.liquipediaPageType === 2) {
        const eventDetailsEl: TCheerioItem = item.children[1].children[2].children[1].children[1].children[1].children[0];
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

      const gameInfo: TMatchInfo = {
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
