import { getGamesFromLiquipedia } from '../methods/get_games_from_liquipedia';
import { logger } from '../utils/logger';

export function getDotaMatches(timezoneCorrection: number) {
  const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'dota', gameImage: 'https://seeklogo.com/images/D/dota-2-logo-C88DABB066-seeklogo.com.png', pathUrl: 'dota2/Liquipedia:Upcoming_and_ongoing_matches', liquipediaPageType: 2 });
  logger(`found ${matches.length} dota matches`);
  return matches;
}
