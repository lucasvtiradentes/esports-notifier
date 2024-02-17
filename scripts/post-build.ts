import { DynMarkdown } from 'dyn-markdown';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const FILES = {
  package: './package.json',
  readme: './README.md',
  configs: './resources/configs.ts',
  gas_permissions: './dist/setup/permissions.json',
  gas_setup: './dist/setup/setup.js',
  gas_dev: './dist/setup/index_dev.js',
  gas_prod: './dist/index.js'
};

const README_DYNAMIC_FIELDS = {
  gasAppsScriptContent: 'GAS_APPSSCRIPT',
  gasSetupContent: 'GAS_SETUP'
} as const;

type TReadmeDynamicFields = (typeof README_DYNAMIC_FIELDS)[keyof typeof README_DYNAMIC_FIELDS];

const VERSION = JSON.parse(readFileSync(FILES.package, { encoding: 'utf8' })).version;

(async () => {
  mkdirSync('./dist/setup');

  const gasSetupFileContent = getGasSetupGasFileContent(FILES.configs, VERSION);
  writeFileSync(FILES.gas_setup, gasSetupFileContent, { encoding: 'utf-8' });

  const gasAllowPermissionFileContent = getGasAllowPermissionFileContent();
  writeFileSync(FILES.gas_permissions, gasAllowPermissionFileContent);

  const originalContent = readFileSync(FILES.gas_prod, { encoding: 'utf8' });
  const esportsNotifierDevContent = originalContent.split("})(this, (function () { 'use strict';\n")[1].split('\n').slice(0, -2).join('\n');
  writeFileSync(FILES.gas_dev, `function getEsportsNotifierDev(){\n${esportsNotifierDevContent}\n}`, { encoding: 'utf-8' });

  const readmeFile = new DynMarkdown<TReadmeDynamicFields>(FILES.readme);
  readmeFile.updateField(README_DYNAMIC_FIELDS.gasSetupContent, `<pre>\n${gasSetupFileContent}\n</pre>`);
  readmeFile.updateField(README_DYNAMIC_FIELDS.gasAppsScriptContent, `<pre>\n${gasAllowPermissionFileContent}\n</pre>`);
  readmeFile.saveFile();
})();

/* ========================================================================== */

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

function getGasSetupGasFileContent(configFile: string, version: string) {
  let configContent = readFileSync(configFile, { encoding: 'utf-8' });
  configContent = configContent.replace(`import { TConfigs } from '../src/consts/types';`, '');
  configContent = configContent.replace('\n\n// prettier-ignore\n', '');
  configContent = configContent.replace('export const configs: TConfigs = ', '');
  // prettier-ignore
  configContent = configContent.split('\n').map((row, index) => index === 0 ? row : `  ${row}`).slice(0, -1).join('\n')

  const gasSetupContent = `const CONFIGS = ${configContent}

function getEsportsNotifier(){

  let esportsNotifier;
  const useDevVersion = false

  if (useDevVersion){
    const EsportsNotifier = getEsportsNotifierDev()
    esportsNotifier = new EsportsNotifier(CONFIGS);
  } else {
    const version = "${version}"
    const content = UrlFetchApp.fetch(\`https://cdn.jsdelivr.net/npm/esports-notifier@\${version}\`).getContentText();
    eval(content)
    esportsNotifier = new EsportsNotifier(CONFIGS);
  }

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
