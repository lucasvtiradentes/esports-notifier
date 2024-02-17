import { APP_INFO } from './consts/app_info';
import { ERRORS } from './consts/errors';
import { TConfigs, TExtendedConfigs } from './consts/types';
import { getAllTodayMatches, getFavoriteTeamsMatches } from './methods/get_user_teams_games';
import { sendEmail } from './methods/send_games_email';
import { validateConfigs } from './methods/validate_configs';
import { logger } from './utils/logger';
import { getDateFixedByTimezone } from './utils/utils';

class EsportsNotifier {
  private extended_configs = {
    configs: null,
    today_date: '',
    user_email: '',
    environment: typeof UrlFetchApp === 'undefined' ? 'development' : 'production'
  } satisfies TExtendedConfigs;

  constructor(config: TConfigs) {
    validateConfigs(config);
    this.extended_configs.configs = config;
    this.extended_configs.today_date = getDateFixedByTimezone(new Date(), config.datetime.diffHoursFromGmtTimezone).toISOString().split('T')[0];
    this.extended_configs.user_email = this.extended_configs.environment === 'production' ? Session.getActiveUser().getEmail() : '';

    logger(`${APP_INFO.name} is running at version ${APP_INFO.version} in ${this.extended_configs.environment} environment`);
    logger(`check the docs for your version here: ${`https://github.com/${APP_INFO.github_repository}/tree/v${APP_INFO.version}#readme`}`);
  }

  /* MAIN FUNCTION ========================================================== */

  install() {
    logger(`install ${APP_INFO.name}`);
    const timeArr = this.extended_configs.configs.datetime.timeToSendEmail.split(':');
    if (timeArr.length !== 2) {
      throw new Error(ERRORS.timeToSendEmailIncorrect);
    }

    const tickSyncTrigger = ScriptApp.getProjectTriggers().find((item) => item.getHandlerFunction() === this.extended_configs.configs.settings.loopFunction);
    if (tickSyncTrigger) {
      logger(`removed old trigger of function ${this.extended_configs.configs.settings.loopFunction}`);
      ScriptApp.deleteTrigger(tickSyncTrigger);
    }

    logger(`the loop function ${this.extended_configs.configs.settings.loopFunction} will be triggered everyday at ${this.extended_configs.configs.datetime.timeToSendEmail}`);
    ScriptApp.newTrigger(this.extended_configs.configs.settings.loopFunction)
      .timeBased()
      .everyDays(1)
      .atHour(Number(timeArr[0]) - this.extended_configs.configs.datetime.diffHoursFromGmtTimezone)
      .nearMinute(Number(timeArr[1]))
      .create();
  }

  uninstall() {
    logger(`uninstall ${APP_INFO.name}`);
    const tickSyncTrigger = ScriptApp.getProjectTriggers().find((item) => item.getHandlerFunction() === this.extended_configs.configs.settings.loopFunction);

    if (tickSyncTrigger) {
      ScriptApp.deleteTrigger(tickSyncTrigger);
    }
  }

  checkTodayGames() {
    const allMatches = getAllTodayMatches(this.extended_configs.configs);
    const favoriteTeamsMatches = getFavoriteTeamsMatches(allMatches, this.extended_configs.configs);
    const onlyTodayMatches = favoriteTeamsMatches.filter((game) => game.date === this.extended_configs.today_date);
    logger(`there were found ${onlyTodayMatches.length} of your favorite teams today`, 'after');

    const matchesToNotify = this.extended_configs.configs.settings.notifyOnlyAboutTodayGames ? onlyTodayMatches : favoriteTeamsMatches;
    sendEmail(matchesToNotify, this.extended_configs);
  }
}

export default EsportsNotifier;
