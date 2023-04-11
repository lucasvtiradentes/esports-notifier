import { readFileSync } from 'node:fs';

const distFile = './dist/EsportsNotifier.min.js';
const gcalSyncContent = readFileSync(distFile, { encoding: 'utf-8' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny: any = global;
eval(`globalAny.EsportsNotifier = ${gcalSyncContent}`);

export default globalAny.EsportsNotifier;
