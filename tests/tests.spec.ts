import EsportsNotifier from '../src/index';
import { configs } from '../resources/configs';

it('should throw an error when initializing without configs', () => {
  expect(() => {
    const config = undefined as any;
    new EsportsNotifier(config);
  }).toThrow('You must specify the settings when starting the class');
});

it('should not throw an error when initializing with valid configs', () => {
  expect(new EsportsNotifier(configs)).toHaveProperty('extended_configs');
});
