import { getGamesFromLiquipedia } from '../methods/get_games_from_liquipedia';
import { logger } from '../utils/logger';

export function getRocketLeagueMatches(timezoneCorrection: number) {
  const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'rocketLeague', gameImage: 'https://upload.wikimedia.org/wikipedia/he/thumb/6/68/Rocket_league_logo_1.jpeg/675px-Rocket_league_logo_1.jpeg?20210526204716', pathUrl: 'rocketleague/Liquipedia:Matches', liquipediaPageType: 3 });
  logger(`found ${matches.length} rocketLeague matches`);
  return matches;
}
