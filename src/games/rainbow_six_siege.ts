import { getGamesFromLiquipedia } from '../methods/get_games_from_liquipedia';
import { logger } from '../utils/logger';

export function getR6Matches(timezoneCorrection: number) {
  const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'rainbowSixSiege', gameImage: 'https://www.clipartmax.com/png/small/308-3080527_0-tom-clancys-rainbow-six-siege.png', pathUrl: 'rainbowsix/Liquipedia:Upcoming_and_ongoing_matches', liquipediaPageType: 2 });
  logger(`found ${matches.length} r6 matches`);
  return matches;
}
