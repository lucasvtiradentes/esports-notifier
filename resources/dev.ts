import EsportsNotifier from './export-lib';
import { config } from './config';

const esportsNotifier = new EsportsNotifier(config);
console.log(esportsNotifier);
// console.log(esportsNotifier.getAllTodayMatches());
