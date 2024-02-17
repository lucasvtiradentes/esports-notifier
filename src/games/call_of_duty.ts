import { getGamesFromLiquipedia } from '../methods/get_games_from_liquipedia';
import { logger } from '../utils/logger';

export function getCallOfDutyMatches(timezoneCorrection: number) {
  const matches = getGamesFromLiquipedia({ timezoneCorrection, gameName: 'callOfDuty', gameImage: 'https://profile.callofduty.com/resources/cod/images/shared-logo.jpg', pathUrl: 'callofduty/Liquipedia:Upcoming_and_ongoing_matches', liquipediaPageType: 2 });
  logger(`found ${matches.length} cod matches`);
  return matches;
}
