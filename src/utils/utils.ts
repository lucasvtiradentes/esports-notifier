export function getDateFixedByTimezone(date: Date, timeZoneIndex: number) {
  date.setHours(date.getHours() + timeZoneIndex);
  return date;
}

export function parseHtmlData(content: string) {
  const cheerioLib = globalThis.Cheerio as any;
  return cheerioLib.load(content);
}

export function getPageContent(url: string) {
  return UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText();
}
