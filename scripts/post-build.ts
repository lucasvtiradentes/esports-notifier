import { DynMarkdown } from 'dyn-markdown';
import minify from 'minify';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';

(async () => {
  const FILES = {
    package: './package.json',
    readme: './README.md',
    gasAppsScript: './dist/GAS-appsscript.json',
    gasSetup: './dist/GAS-setup.js',
    esportsNotifierUdm: `./dist/UMD-EsportsNotifier.js`,
    esportsNotifier: `./dist/EsportsNotifier.js`,
    esportsNotifierMin: `./dist/EsportsNotifier.min.js`
  };

  const README_FILES = {
    gasAppsScriptContent: 'GAS_APPSSCRIPT',
    gasSetupContent: 'GAS_SETUP'
  };

  const VERSION = JSON.parse(readFileSync(FILES.package, { encoding: 'utf8' })).version;

  createSetupGasFile(FILES.gasSetup, VERSION);
  createAppscriptFile(FILES.gasAppsScript);

  const readmeFile = new DynMarkdown(FILES.readme);
  readmeFile.updateField(README_FILES.gasSetupContent, readFileSync(FILES.gasSetup, { encoding: 'utf-8' }));
  readmeFile.updateField(README_FILES.gasAppsScriptContent, readFileSync(FILES.gasAppsScript, { encoding: 'utf-8' }));
  readmeFile.saveFile();

  const VERSION_UPDATE = `// version`;
  replaceFileContent(FILES.esportsNotifierUdm, VERSION_UPDATE, `this.VERSION = '${VERSION}'; ${VERSION_UPDATE}`);
  replaceFileContent(FILES.readme, VERSION_UPDATE, `// const version = "${VERSION}" ${VERSION_UPDATE}`);

  await minifyFile(FILES.esportsNotifierUdm, FILES.esportsNotifierMin);

  unlinkSync(FILES.esportsNotifier);
  unlinkSync(FILES.esportsNotifierUdm);
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

async function minifyFile(filePath: string, outFile: string) {
  const minifiedContent = await minify(filePath);
  writeFileSync(outFile, minifiedContent);
}

function createAppscriptFile(outFile: string) {
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

  writeFileSync(outFile, appsScript);
}

function createSetupGasFile(outFile: string, version: string) {
  let configContent = readFileSync('./resources/config.ts', { encoding: 'utf-8' });
  configContent = configContent.replace('export const config = ', '');
  configContent = configContent.replace('// prettier-ignore\n', '');

  const gasSetupContent = `const CONFIGS = ${configContent}
function getEsportsNotifier() {
  const version = "${version}"
  const content = getGithubFileContent('lucasvtiradentes/esports-notifier', 'master');
  eval(\`this.EsportsNotifier = \` + content);
  const esportsNotifier = new EsportsNotifier(CONFIGS);
  return esportsNotifier;
}

function checkTodayGames() {
  const esportsNotifier = getEsportsNotifier();
  esportsNotifier.checkTodayGames();
}

function setup() {
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

  writeFileSync(outFile, gasSetupContent);
}
