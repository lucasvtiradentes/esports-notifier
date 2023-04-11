import { config } from './config';
import EsportsNotifier from '../src/EsportsNotifier';

const esportsNotifier = new EsportsNotifier(config);
console.log(esportsNotifier);
// console.log(esportsNotifier.getAllTodayMatches());
