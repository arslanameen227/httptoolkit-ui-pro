import * as path from 'path';
import merge from "webpack-merge";
import { RawSource } from 'webpack-sources';

import { InjectManifest } from 'workbox-webpack-plugin';
import * as ssri from "ssri";
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CspHtmlWebpackPlugin from 'csp-html-webpack-plugin';

import common from "./webpack.common";

// Sentry disabled - no source map upload
const shouldPublishSentryRelease = false;
console.log('Sentry source map upload disabled');

// CSP reporting disabled
const CSP_REPORT_URL = false;
console.log('CSP reporting disabled');

// Output compiled CSP into a Caddy config file, that's later imported by our Caddyfile:
const processCsp = (type: 'report' | 'strict') => (
    builtPolicy: any,
    _htmlPluginData: any,
    _obj: any,
    compilation: any
) => {
    const header = `
        header ${
            type === 'strict' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only'
        } "${builtPolicy}"
        header Reporting-Endpoints \`csp-endpoint="${CSP_REPORT_URL}"\`
    `;
    compilation.emitAsset(`csp-${type}.caddyfile`, new RawSource(header));
}

export default merge(common, {
    mode: "production",

    devtool: "source-map",

    // Automatically split into source/vendor bundle chunks.
    // Here because this breaks TS-node in the tests, not clear why.
    optimization: {
        chunkIds: 'named',
        minimizer: [
            // Custom Terser config to handle Firebase ES modules
            new (require('terser-webpack-plugin'))({
                terserOptions: {
                    ecma: 2020,
                    warnings: false,
                    parse: {
                        ecma: 2020
                    },
                    compress: {
                        ecma: 2015,
                        warnings: false,
                        comparisons: false,
                        inline: 2,
                    },
                    mangle: {
                        safari10: true,
                    },
                    format: {
                        ecma: 2015,
                        comments: false,
                    },
                },
                extractComments: false,
                // Exclude Firebase chunks from minification to avoid ES module issues
                exclude: /node_modules_firebase_.*\.bundle\.js$/
            })
        ],
        splitChunks: {
            chunks: 'all',

            // Split out various extra chunks for libraries that we know to be large & either
            // rarely used or updated differently to other code in the frontend. The goal is to
            // avoid re-downloading large non-updated libs when often-updated libs change.
            // This is a bit suspect - definitely more art then science right now.
            cacheGroups: {
                // Zstd is rarely used, big-ish, always loaded async, and v rarely changed:
                zstd: {
                    test: /[\\/]node_modules[\\/]zstd-codec[\\/]/,
                    name: 'zstd'
                },

                // Monaco is loaded async, v large, and rarely changed:
                monaco: {
                    test: /[\\/]node_modules[\\/](monaco-editor|react-monaco-editor)[\\/]/,
                    name: 'monaco'
                },

                // APIs change on a completely independent schedule to anything else:
                apis: {
                    test: /[\\/]node_modules[\\/]openapi-directory[\\/]/,
                    name: 'apis'
                },

                // Mockttp is relatively frequently changed, so pulling it into
                // a separate chunk avoids churn elsewhere:
                mockttp: {
                    test: /[\\/]node_modules[\\/]mockttp[\\/]/,
                    name: 'mockttp',
                    chunks: 'async',
                    priority: 20,
                    reuseExistingChunk: true
                },

                // Firebase Analytics needs special handling due to ES modules:
                firebase: {
                    test: /[\\/]node_modules[\\/]@firebase[\\/]|[\\/]node_modules[\\/]firebase[\\/]/,
                    name: 'firebase',
                    enforce: true,
                    chunks: 'async',
                    priority: 20,
                    reuseExistingChunk: true,
                    usedExports: false,
                    minChunks: 1
                }
            }
        }
    },

    plugins: [
        new InjectManifest({
            swSrc: path.join(
                path.dirname(common.entry as string),
                'services',
                'ui-update-worker.ts'
            ),
            exclude: [
                'google-fonts',
                /^api\//,
                'ui-update-worker.js',
                /\.map$/,
                /\.caddyfile$/
            ],
            maximumFileSizeToCacheInBytes: 100 * 1024 * 1024,
            manifestTransforms: [
                (originalManifest: any, compilation: any) => {
                    // Add integrity info to every file, to ensure the cache can't be
                    // corrupted. We have seen this in practice, I think due to AWS outage
                    // issues? This helps protect against possible corruptions:
                    const manifest = originalManifest.map((entry: any) => {
                        const asset = compilation.getAsset(entry.url);
                        const assetSource = asset.source.source();
                        entry.integrity = ssri.fromData(
                            assetSource instanceof ArrayBuffer
                                ? Buffer.from(assetSource) // Wasm!
                                : assetSource
                        ).toString();
                        return entry;
                    });

                    // If any integrity checks fail during startup, precaching stops will
                    // stop there, and the SW won't be updated.

                    return { manifest };
                },
            ] as any
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            excludeAssets: /api\/.*\.json/
        })
    ]
});
