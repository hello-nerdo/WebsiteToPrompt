const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const ZipPlugin = require('zip-webpack-plugin');

dotenv.config();

module.exports = {
  mode: 'production',
  devtool: false,

  entry: {
    background: './src/background.js',
    'content-script': './src/content-script.js',
    popup: './src/popup.js',
    dashboard: './src/dashboard.js',
    analytics: './src/analytics.js',
  },

  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: '[name].js',
    clean: true,
  },

  optimization: {
    minimize: true,
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.GA_PART1': JSON.stringify(process.env.GA_PART1 || ''),
      'process.env.GA_PART2': JSON.stringify(process.env.GA_PART2 || ''),
      'process.env.GA_PART3': JSON.stringify(process.env.GA_PART3 || ''),
      'process.env.GA_PART4': JSON.stringify(process.env.GA_PART4 || ''), 
      'process.env.GA_PART5': JSON.stringify(process.env.GA_PART5 || ''), 
      'process.env.GA_PART6': JSON.stringify(process.env.GA_PART6 || ''), 
      'process.env.GA_PART7': JSON.stringify(process.env.GA_PART7 || ''), 
      'process.env.GA_PART8': JSON.stringify(process.env.GA_PART8 || ''), 
      'process.env.GA_PART9': JSON.stringify(process.env.GA_PART9 || ''), 
      'process.env.GA_PART10': JSON.stringify(process.env.GA_PART10 || ''), 
    }),

    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/manifest.json', to: '.' },
        { from: 'src/**/*.html', to: '[name][ext]' },
        { from: 'src/icons', to: 'icons', noErrorOnMissing: true },
        { from: 'src/libs/turndown.js', to: 'libs' },
        { from: 'src/logo.png', to: '.' }
      ],
    }),
    
    new WebpackObfuscator(
        {
            rotateStringArray: true,
            stringArray: true,
            stringArrayThreshold: 1.0,
        },
        ['**/!(analytics).js']
    ),

   new ZipPlugin({
     filename: 'WebsiteToPrompt.zip',
   }),
  ],

  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  }
};
