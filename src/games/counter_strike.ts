import { getGamesFromLiquipedia } from '../methods/get_games_from_liquipedia';
import { logger } from '../utils/logger';

export function getCsgoMatches(timezoneCorrection: number) {
  const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'csgo', gameImage: 'https://seeklogo.com/images/C/counter-strike-global-offensive-logo-CFCEFBBCE2-seeklogo.com.png', pathUrl: 'counterstrike/Liquipedia:Matches', liquipediaPageType: 1 });
  logger(`found ${matches.length} csgo matches`);
  return matches;
}
