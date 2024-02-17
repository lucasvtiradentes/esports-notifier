import { TConfigs, TMatchInfo } from '../consts/types';
import { logger } from '../utils/logger';

import { getCallOfDutyMatches } from '../games/call_of_duty';
import { getCsgoMatches } from '../games/counter_strike';
import { getDotaMatches } from '../games/dota';
import { getLolMatches } from '../games/league_of_legends';
import { getR6Matches } from '../games/rainbow_six_siege';
import { getRocketLeagueMatches } from '../games/rocket_league';
import { getValorantMatches } from '../games/valorant';

export function sortGamesByDatetime(arr: TMatchInfo[]) {
  return arr.sort((a, b) => Number(new Date(`${a.date}T${a.time}`)) - Number(new Date(`${b.date}T${b.time}`)));
}

export function getAllTodayMatches(config: TConfigs) {
  const allMatches: TMatchInfo[] = [];

  if (config.esports.games.callOfDuty.sync) {
    allMatches.push(...getCallOfDutyMatches(config.datetime.diffHoursFromGmtTimezone));
  }

  if (config.esports.games.dota.sync) {
    allMatches.push(...getDotaMatches(config.datetime.diffHoursFromGmtTimezone));
  }

  if (config.esports.games.rocketLeague.sync) {
    allMatches.push(...getRocketLeagueMatches(config.datetime.diffHoursFromGmtTimezone));
  }

  if (config.esports.games.leagueOfLegends.sync) {
    allMatches.push(...getLolMatches(config.datetime.diffHoursFromGmtTimezone));
  }

  if (config.esports.games.csgo.sync) {
    allMatches.push(...getCsgoMatches(config.datetime.diffHoursFromGmtTimezone));
  }

  if (config.esports.games.valorant.sync) {
    allMatches.push(...getValorantMatches());
  }

  if (config.esports.games.rainbowSixSiege.sync) {
    allMatches.push(...getR6Matches(config.datetime.diffHoursFromGmtTimezone));
  }

  const todayMatches = sortGamesByDatetime(allMatches);
  logger(`there were found ${todayMatches.length} matches across all selected games`, 'before');

  return todayMatches;
}

export function getFavoriteTeamsMatches(allMatches: TMatchInfo[], config: TConfigs) {
  let filteredMatches: TMatchInfo[] = [];

  filteredMatches = allMatches.filter((item) => {
    const lowerCaseMatchTeams = item.teams.map((team) => team.toLowerCase());

    const lowercaseFavoriteTeams = config.esports.favoriteTeams.map((team) => team.toLowerCase());
    let isGlobalFavoriteTeam = false;
    if (config.settings.strictTeamComparasion) {
      isGlobalFavoriteTeam = lowerCaseMatchTeams.some((matchTeam) => lowercaseFavoriteTeams.includes(matchTeam.toLowerCase()));
    } else {
      isGlobalFavoriteTeam = lowerCaseMatchTeams.some((matchTeam) => lowercaseFavoriteTeams.filter((favTeam) => matchTeam.search(favTeam) > -1).length > 0);
    }

    let isGameFavoriteTeam = false;
    const gameOptions = config.esports.games[item.game.name];
    const lowerCaseGameTeams = gameOptions.teams.map((team) => team.toLowerCase());

    if (config.settings.strictTeamComparasion) {
      isGameFavoriteTeam = lowerCaseMatchTeams.some((matchTeam) => lowerCaseGameTeams.includes(matchTeam.toLowerCase()));
    } else {
      isGameFavoriteTeam = lowerCaseMatchTeams.some((matchTeam) => lowerCaseGameTeams.filter((favTeam) => matchTeam.search(favTeam) > -1).length > 0);
    }

    return isGlobalFavoriteTeam || isGameFavoriteTeam;
  });

  const todayFavoriteTeamsMatches = sortGamesByDatetime(filteredMatches);
  logger(`there were found ${todayFavoriteTeamsMatches.length} of your favorite teams in the next coulpe of days`);

  return todayFavoriteTeamsMatches;
}
