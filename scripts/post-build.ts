import minify from 'minify';
import { readFileSync, writeFileSync, unlinkSync, renameSync } from 'node:fs';
import { DynMarkdown } from 'dyn-markdown';

(async () => {
  createSetupGasFile();
  createAppscriptFile();

  const readmeFile = new DynMarkdown('./README.md');
  readmeFile.updateField('GAS_APPSSCRIPT', readFileSync(`./dist/GAS-appsscript.json`, { encoding: 'utf-8' }));
  // readmeFile.updateField('GAS_APPSSCRIPT', readFileSync(`./dist/GAS-setup.js`, { encoding: 'utf-8' }));
  readmeFile.saveFile();

  const DIST_FILE = `./dist/UMD-EsportsNotifier.js`;
  const packageJson = JSON.parse(readFileSync('./package.json', { encoding: 'utf8' }));

  replaceFileContent(DIST_FILE, `// version`, `this.VERSION = '${packageJson.version}'; // version`);
  replaceFileContent(`./README.md`, `// version`, `const version = "${packageJson.version}" // version`);

  await minifyFile(DIST_FILE);
  unlinkSync(`./dist/EsportsNotifier.js`);
  unlinkSync(`./dist/UMD-EsportsNotifier.js`);
  renameSync(`./dist/UMD-EsportsNotifier.min.js`, `./dist/EsportsNotifier.min.js`);
})();

/* ========================================================================== */

function replaceFileContent(file: string, strToFind: string, strToReplace: string) {
  const originalContent = readFileSync(file, { encoding: 'utf8' });
  // prettier-ignore
  const newContent = originalContent.split('\n').map((line) => {
    const hasSearchedStr = line.search(strToFind) > 0
    const identation = line.length - line.trimStart().length
    return hasSearchedStr ? `${' '.repeat(identation)}${strToReplace}` : line
  }).join('\n');
  writeFileSync(file, newContent);
}

async function minifyFile(filePath: string) {
  const minifiedContent = await minify(filePath);
  writeFileSync(filePath.replace(`js`, `min.js`), minifiedContent);
}

function createAppscriptFile() {
  const appsScript = `{
  "timeZone": "Etc/GMT",
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "Cheerio",
        "version": "14",
        "libraryId": "1ReeQ6WO8kKNxoaA_O0XEQ589cIrRvEBA9qcWpNqdOP17i47u6N9M5Xh0"
      }
    ]
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.scriptapp",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/userinfo.email"
  ],
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}`;

  writeFileSync(`./dist/GAS-appsscript.json`, appsScript);
}

function createSetupGasFile() {
  let configContent = readFileSync('./resources/config.ts', { encoding: 'utf-8' });
  configContent = configContent.replace('export const config = ', '');
  configContent = configContent.replace('// prettier-ignore\n', '');

  const gasSetupContent = `const CONFIGS = ${configContent}
function getEsportsNotifier() {
  const content = getGithubFileContent('lucasvtiradentes/esports-notifier', 'master');
  eval(\`this.EsportsNotifier = \` + content);
  const esportsNotifier = new EsportsNotifier(CONFIGS);
  return esportsNotifier;
}

function checkTodayGames() {
  const esportsNotifier = getEsportsNotifier();
  esportsNotifier.checkTodayGames();
}

function install() {
  const esportsNotifier = getEsportsNotifier();
  esportsNotifier.install();
}

function uninstall() {
  const esportsNotifier = getEsportsNotifier();
  esportsNotifier.uninstall();
}

function getGithubFileContent(repository, branch) {
  const filePath = 'dist/EsportsNotifier.min.js';
  const final_link = \`https://api.github.com/repos/\${repository}/contents/\${filePath}\${branch ? \`?ref=\${branch}\` : ''}\`;
  const response = UrlFetchApp.fetch(final_link, { method: 'get', contentType: 'application/json' });
  const base64Content = JSON.parse(response.toString()).content;
  const decodedArr = Utilities.base64Decode(base64Content);
  const decodedAsString = Utilities.newBlob(decodedArr).getDataAsString();
  return decodedAsString;
}`;

  writeFileSync(`./dist/GAS-setup.js`, gasSetupContent);
}
