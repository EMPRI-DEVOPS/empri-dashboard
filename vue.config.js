module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '/static/' : 'http://127.0.0.1:8080',
    outputDir: 'static',
    indexPath: '../templates/base-vue.html', // relative to outputDir!

    runtimeCompiler: true,
    // von hier: https://github.com/EugeneDae/django-vue-cli-webpack-demo/blob/master/client/vue.config.js
    chainWebpack: config => {
        config.devServer
            .public('http://127.0.0.1:8080')
            .hotOnly(true)
            .headers({
                "Access-Control-Allow-Origin": "*"
            })
            .writeToDisk(filePath => filePath.endsWith('index.html'));
    }
}