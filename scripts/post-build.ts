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

  const gasAllowPermissionFileContent = getGasAllowPermissionFileContent();
  writeFileSync(FILES.gasAppsScript, gasAllowPermissionFileContent);

  const gasSetupFileContent = getGasSetupGasFileContent(VERSION);
  writeFileSync(FILES.gasSetup, gasSetupFileContent);

  const readmeFile = new DynMarkdown(FILES.readme);
  readmeFile.updateField(README_FILES.gasSetupContent, `<pre>\n${gasSetupFileContent}\n</pre>`);
  readmeFile.updateField(README_FILES.gasAppsScriptContent, `<pre>\n${gasAllowPermissionFileContent}\n</pre>`);
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

function getGasAllowPermissionFileContent() {
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

  return appsScript;
}

function getGasSetupGasFileContent(version: string) {
  let configContent = readFileSync('./resources/config.ts', { encoding: 'utf-8' });
  configContent = configContent.replace('export const config = ', '');
  configContent = configContent.replace('// prettier-ignore\n', '');

  const gasSetupContent = `const CONFIGS = ${configContent}
function getEsportsNotifier(){
  const version = "${version}"
  const content = UrlFetchApp.fetch(\`https://cdn.jsdelivr.net/npm/esports-notifier@\${version}\`).getContentText();
  eval(content)
  const esportsNotifier = new EsportsNotifier(CONFIGS)
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
}`;

  return gasSetupContent;
}
