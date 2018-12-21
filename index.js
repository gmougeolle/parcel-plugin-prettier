const prettier = require('prettier');
const { writeFileSync, readFileSync } = require('fs');

const PRETTIER_EXTENSIONS = ['.html', '.js', '.jsx', '.ts', '.tsx', '.less', '.css', '.scss', '.json'];
let sourceAssets = [];
let encoding = "utf-8"; //TODO : retrieve this from each asset

module.exports = function (bundler) {
    bundler.on('buildEnd', () => {
        bundler.loadedAssets.forEach(asset => {
            //1. We add the asset in itself, if it is in our supported list
            addSourceAsset(asset.name)

            //2. We add the asset's deps if they are in our supported list
            asset.dependencies.forEach(dep => {
                let name = dep.name

                if (dep.resolved)
                    name = dep.resolved

                addSourceAsset(name)
            })
        })

        //3. We pass the list through prettier
        sourceAssets.forEach(async asset => {
            const file = await readFileSync(asset, encoding);
            let config = await prettier.resolveConfig(asset) || {};
            config.filepath = asset;

            const prettierFile = prettier.format(file, config);

            if(prettierFile !== file)
                writeFileSync(asset, prettierFile, encoding);
        })
    })

    function isExtentionSupported(string, suffixes) {
        return suffixes.some(suffix => string.endsWith(suffix));
    }

    function addSourceAsset(name) {
        if (isExtentionSupported(name, PRETTIER_EXTENSIONS) && !sourceAssets.includes(name))
            sourceAssets.push(name);
    }
};