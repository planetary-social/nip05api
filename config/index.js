import deepmerge from 'deepmerge';
import * as _default from './default.js';
import production from './production.js';
import development from './development.js';
import test from './test.js';

const configs = {
    production,
    development,
    test,
};

export default (function config() {
    const env = process.env.NODE_ENV;
    const envConfig = configs[env];

    return deepmerge(_default.default, envConfig);
})();
