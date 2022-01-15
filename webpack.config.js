const webpack = require('webpack'), 
      path    = require('path');

module.exports = {
    entry: './interaction-handler.js', 
    mode: 'production', 
    output: {
        library: {
            name:   'InteractionHandler', 
            type:   'umd', 
            export: 'default'
        }, 
        globalObject: 'this', 
        path:         path.resolve(__dirname), 
        filename:     'interaction-handler.min.js'
    },
    module: {
        rules: [
            {
                test:    /\.js$/,
                exclude: /(node_modules)/,
                loader:  'babel-loader', 
                options: {presets: ['@babel/preset-env']}
            }
        ]
    }, 
    optimization: {
        concatenateModules: true, 
        minimize: true
    }
};