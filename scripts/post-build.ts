import minify from 'minify';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';

(async () => {
  const DIST_FILE = `./dist/EsportsNotifier.js`;
  const packageJson = JSON.parse(readFileSync('./package.json', { encoding: 'utf8' }));

  replaceFileContent(DIST_FILE, `// version`, `this.VERSION = '${packageJson.version}'; // version`);
  replaceFileContent(`./README.md`, `// version`, `const version = "${packageJson.version}" // version`);

  await minifyFile(DIST_FILE);
  unlinkSync(DIST_FILE);
  createSetupGasFile();
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

function createSetupGasFile() {
  const config = readFileSync('./resources/config.ts', { encoding: 'utf-8' });
  const fixedConfigString = config.replace('export const config = ', '');
  const gasSetupContent = `const CONFIGS = ${fixedConfigString}
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
