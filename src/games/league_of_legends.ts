import { getGamesFromLiquipedia } from '../methods/get_games_from_liquipedia';
import { logger } from '../utils/logger';

export function getLolMatches(timezoneCorrection: number) {
  const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'leagueOfLegends', gameImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/LoL_icon.svg/256px-LoL_icon.svg.png?20201029024159', pathUrl: 'leagueoflegends/Liquipedia:Matches', liquipediaPageType: 2 });
  logger(`found ${matches.length} lol matches`);
  return matches;
}
