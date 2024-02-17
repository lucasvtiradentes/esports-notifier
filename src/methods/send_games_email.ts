import { APP_INFO } from '../consts/app_info';
import { TExtendedConfigs, TMatchInfo } from '../consts/types';
import { logger } from '../utils/logger';

export function generateEmailContent(gamesToInform: TMatchInfo[], extendedConfigs: TExtendedConfigs) {
  let emailHtml = '';

  const tableStyle = `border: 1px solid #333; width: 90%`;
  const rowStyle = `text-align: center;`;
  const columnStyle = `border: 1px solid #333; white-space: nowrap;`;

  // prettier-ignore
  const header = `<tr style="${rowStyle}">
                      <th style="${columnStyle}">Time</th>
                      <th style="${columnStyle}">Match</th>
                      <th style="${columnStyle}">TMatchInfo</th>
                    </tr>`;

  const getTableBodyItemsHtml = () => {
    return gamesToInform
      .map((item) => {
        const teamAImage = item.teamA.image || item.teamA.countryImage || '';
        const teamBImage = item.teamB.image || item.teamB.countryImage || '';

        // prettier-ignore
        const itemRow = `<tr style="${rowStyle}">
                            <td style="${columnStyle}">
                              <div style="text-align: center;">
                                ${extendedConfigs.configs.settings.notifyOnlyAboutTodayGames ? `<p style="white-space: nowrap;">${item.time}</p>` : `<p style="white-space: nowrap;">${item.date === extendedConfigs.today_date ? `<span style="color: red;">${item.date}</span>` : item.date}</p><p style="white-space: nowrap;">${item.time}</p>`}
                              </div>
                            </td>
                            <td style="${columnStyle} padding: 10px 0;">
                              <a href="${item.link}">
                                <div style="display: flex; align-items: center; justify-content: center; gap: 100px;">
                                  <div style="width: 100%;">
                                    ${teamAImage === '' ? '' : `<img src="${teamAImage}" width="30px" height="30px"><br>`}
                                    <span>${item.teamA.name}</span>
                                  </div>
                                  <div style="width: 100%;">
                                    ${teamBImage === '' ? '' : `<img src="${teamBImage}" width="30px" height="30px"><br>`}
                                    <span>${item.teamB.name}</span>
                                  </div>
                                  </div>
                              </a>
                              <br>
                              ${item.eventLink !== '' ? `<a href="${item.eventLink}" style="word-wrap: break-word;">${item.event}</a>` : `<span style="word-wrap: break-word;">${item.event}</span>`}
                            </td>
                            <td style="${columnStyle} padding: 10px 0;">
                              <div style="text-align: center;">
                                <a href="${item.game.link}">
                                  <img width="30px" height="30px" src="${item.game.image}"><br>
                                  <span>${item.game.name}</span>
                                </a>
                              </div>
                            </td>
                          </tr>`;
        return itemRow;
      })
      .join('');
  };

  // prettier-ignore
  const table = `<center>
                    <table style="${tableStyle}">
                      <colgroup>
                        <col span="1" style="width: 20%;">
                        <col span="1" style="width: 60%;">
                        <col span="1" style="width: 20%;">
                      </colgroup>
                      <thead>${header}</thead>
                      <tbody>${getTableBodyItemsHtml()}</tbody>
                    </table>
                  </center>`;

  emailHtml = emailHtml + `Hi,<br><br>\n`;
  emailHtml = emailHtml + `there ${gamesToInform.length === 1 ? 'is' : 'are'} <b>${gamesToInform.length} ${gamesToInform.length === 1 ? 'game' : 'games'}</b> of your favorite teams ${extendedConfigs.configs.settings.notifyOnlyAboutTodayGames ? 'today' : 'soon'}: <br><br>\n`;
  emailHtml = emailHtml + `${table}<br>\n`;
  emailHtml = emailHtml + `Regards, <br>your <a href="https://github.com/${APP_INFO.github_repository}#readme"><b>${APP_INFO.name}</b></a> bot`;

  return emailHtml;
}

export function sendEmail(favoriteTeamsMatches: TMatchInfo[], extendedConfig: TExtendedConfigs) {
  if (favoriteTeamsMatches.length === 0) {
    return;
  }

  logger(`email sent to ${extendedConfig.user_email} to inform about ${favoriteTeamsMatches.length} games`);

  MailApp.sendEmail({
    to: extendedConfig.user_email,
    subject: `${APP_INFO.name} - ${favoriteTeamsMatches.length} ${favoriteTeamsMatches.length === 1 ? 'game' : 'games'} of your favorite teams ${extendedConfig.configs.settings.notifyOnlyAboutTodayGames ? `today - ${extendedConfig.today_date}` : 'soon'}`,
    htmlBody: generateEmailContent(favoriteTeamsMatches, extendedConfig)
  });
}
