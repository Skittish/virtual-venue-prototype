
const WorkerPlugin = require('worker-plugin');

module.exports = function override(config, env) {
    config.module.rules.push({
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
    })
    config.plugins.push(new WorkerPlugin());
    return config;
}