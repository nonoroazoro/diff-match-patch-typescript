const path = require("path");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const ROOT_PATH = path.resolve(__dirname, "../../");
const DIST_PATH = path.resolve(ROOT_PATH, "dist");
const TS_CONFIG_PATH = path.resolve(ROOT_PATH, "tsconfig.es.json");

module.exports = {
    mode: "production",
    context: ROOT_PATH,
    entry: {
        "diff-match-patch.min": ["./src"]
    },
    output: {
        path: DIST_PATH,
        publicPath: "/",
        filename: "[name].js",
        library: "dmp",
        libraryTarget: "umd"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    "cache-loader",
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: true,
                            configFile: TS_CONFIG_PATH
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            checkSyntacticErrors: true,
            TS_CONFIG_PATH,
            tslint: true
        }),
        new webpack.IgnorePlugin(/\.js\.map$/),
        // new BundleAnalyzerPlugin()
    ],
    stats: {
        children: false,
        modules: false
    }
};
