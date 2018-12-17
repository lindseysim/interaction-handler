const webpack = require('webpack'), 
      path    = require('path');
module.exports = {
    entry: './interaction-handler.js', 
    mode: 'production', 
    output: {
        library: 'InteractionHandler', 
        libraryTarget: 'this', 
        path: path.resolve(__dirname), 
        filename: 'interaction-handler.min.js'
    },
    module: {
        rules: [
            {
                test:    /\.js$/,
                exclude: /(node_modules)/,
                loader:  'babel-loader', 
                query: {
                    presets: ['@babel/preset-env']
                }
            }
        ]
    }, 
    optimization: {
        concatenateModules: true, 
        minimize: true
    }
};