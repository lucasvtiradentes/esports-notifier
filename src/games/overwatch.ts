import { getGamesFromLiquipedia } from '../methods/get_games_from_liquipedia';
import { logger } from '../utils/logger';

export function getOverwatchMatches(timezoneCorrection: number) {
  const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'overwatch', gameImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Overwatch_circle_logo.svg/600px-Overwatch_circle_logo.svg.png?20160426111034', pathUrl: 'overwatch/Liquipedia:Upcoming_and_ongoing_matches', liquipediaPageType: 1 });
  logger(`found ${matches.length} overwatch matches`);
  return matches;
}
