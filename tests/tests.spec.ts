import EsportsNotifier from './export-lib';
import { config } from './lib-config';

it('should throw an error when initializing without configs', () => {
  expect(() => {
    new EsportsNotifier();
  }).toThrow('You must specify the settings when starting the class');
});

it('should not throw an error when initializing with valid configs', () => {
  expect(new EsportsNotifier(config)).toHaveProperty('APPNAME');
});
