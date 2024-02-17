import { ERRORS } from '../consts/errors';
import { TConfigs } from '../consts/types';

export function validateConfigs(config: TConfigs) {
  if (!config) {
    throw new Error(ERRORS.mustSpecifyConfig);
  }

  const validationArr = [
    { objToCheck: config, requiredKeys: ['esports', 'datetime', 'settings'], name: 'configs' },
    { objToCheck: config?.esports, requiredKeys: ['favoriteTeams', 'games'], name: 'configs.esports' },
    { objToCheck: config?.esports?.games, requiredKeys: ['csgo', 'valorant', 'rainbowSixSiege', 'leagueOfLegends'], name: 'configs.esports.games' },
    { objToCheck: config?.datetime, requiredKeys: ['diffHoursFromGmtTimezone', 'timeToSendEmail'], name: 'configs.datetime' },
    { objToCheck: config?.settings, requiredKeys: ['notifyOnlyAboutTodayGames', 'strictTeamComparasion', 'maintanceMode', 'loopFunction'], name: 'configs.settings' }
  ];

  validationArr.forEach((item) => {
    const { objToCheck, requiredKeys, name } = item;
    requiredKeys.forEach((key) => {
      if (!objToCheck || !Object.keys(objToCheck).includes(key)) {
        throw new Error(`missing key in ${name}: ${key}`);
      }
    });
  });
}
