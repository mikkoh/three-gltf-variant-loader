const merge = require("webpack-merge");
const path = require("path");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const commonConfig = require("./common.config");

const config = merge(commonConfig, {
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, "../example/assets"),
        to: "assets",
        toType: "dir"
      }
    ]),
    new HtmlWebpackPlugin({
      template: "./example/index.html"
    })
  ]
});

module.exports = config;
