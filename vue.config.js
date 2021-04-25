module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '/static/' : 'http://127.0.0.1:8080',
    outputDir: 'static',
    indexPath: '../templates/base-vue.html', // relative to outputDir!
    filenameHashing: false,

    runtimeCompiler: true,
    // von hier: https://github.com/EugeneDae/django-vue-cli-webpack-demo/blob/master/client/vue.config.js
    devServer: {
        writeToDisk: filePath => filePath.endsWith('index.html') || filePath.endsWith('.css')
    },
    css: {
        extract: true,
        sourceMap: true,
        loaderOptions: {
            css: {
                // options here will be passed to css-loader
            },
        }
    }
}