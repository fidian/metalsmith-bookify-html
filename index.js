const cheerio = require('cheerio');
const pluginKit = require('metalsmith-plugin-kit');
const debug = require('debug')('metalsmith-bookify-html');
const urijs = require('urijs');

function absoluteLinkToTarget(filename, href) {
    if (href.charAt(0) === '/') {
        return href;
    }

    if (href.indexOf('://') >= 0) {
        return href;
    }

    return urijs(href).absoluteTo('/' + filename).toString();
}

function relativeLinkToTarget(dest, absoluteLink) {
    return urijs(absoluteLink).relativeTo('/' + dest).toString();
}

function getContents(filename, file) {
    const contents = file.contents.toString();
    return `<a name="${filename}"></a>${contents}`;
}

function processHtml(filename, file, toInclude, dest, files, indexFile) {
    let contents = getContents(filename, file);
    const $ = cheerio.load(contents);

    $('a[href]').each((index, element) => {
        const link = $(element).attr('href');
        const target = absoluteLinkToTarget(filename, link);
        const targetFilename = getFilename(files, target, indexFile);
        debug(`found href: ${link} -> ${targetFilename}`);
        $(element).attr('href', '#' + targetFilename);

        if (targetFilename) {
            toInclude.push(targetFilename);
        } else {
            console.error(`Unable to resolve link "${link}" in file "${filename}"`);
        }
    });
    $('img[src]').each((index, element) => {
        const link = $(element).attr('src');
        const target = absoluteLinkToTarget(filename, link);
        const updatedRef = relativeLinkToTarget(dest, target);
        debug(`found src: ${link} -> ${updatedRef}`);
        $(element).attr('src', updatedRef);
    });

    return $.html();
}

function getFilename(files, name, indexFile) {
    while (name.charAt(0) === '/') {
        name = name.substr(1);
    }

    if (files[name]) {
        return name;
    }

    let indexName = name;

    if (indexName.charAt(indexName.length - 1) !== '/') {
        indexName += '/';
    }

    indexName += indexFile;

    if (files[indexName]) {
        return indexName;
    }

    return null;
}

module.exports = (options) => {
    options = pluginKit.defaultOptions({
        dest: 'book.html',
        indexFile: 'index.html',
        metadata: {},
        src: [ 'index.html' ]
    }, options);

    options.src = [].concat(options.src);

    if (typeof options.metadata !== 'object') {
        options.metadata = {};
    }

    return pluginKit.middleware({
        before: (files) => {
            let content = '';
            const toInclude = [...options.src];
            const processed = {};

            for (const src of toInclude) {
                const filename = getFilename(files, src, options.indexFile);

                if (filename && !processed[filename]) {
                    processed[filename] = true;
                    const file = files[filename];
                    debug(`processing file: ${filename}`);
                    content += processHtml(src, file, toInclude, options.dest, files, options.indexFile);
                } else if (!filename && !processed[src]) {
                    processed[src] = true;
                    debug(`file not found: ${src}`);
                }
            }

            debug(`adding combined content as file: ${options.dest}`);
            pluginKit.addFile(files, options.dest, content);

            if (options.metadata) {
                for (const [key, value] of Object.entries(options.metadata)) {
                    files[options.dest][key] = value;
                }
            }
        }
    });
}
