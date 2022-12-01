const cheerio = require('cheerio');
const pluginKit = require('metalsmith-plugin-kit');
const debug = require('debug')('metalsmith-bookify-html');
const urijs = require('urijs');

function absoluteLinkToTarget(filename, href) {
    if (href.charAt(0) === '/') {
        return href;
    }

    if (href.indexOf('://') >= 0 || href.indexOf('mailto:') === 0) {
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

function processHtml(filename, file, toInclude, dest, files, indexFile, selector) {
    let contents = getContents(filename, file);
    const $ = cheerio.load(contents);

    $('a[href]').each((index, element) => {
        const link = $(element).attr('href');
        const target = absoluteLinkToTarget(filename, link);

        if (target.indexOf('://') >= 0 || target.indexOf('mailto:') === 0) {
            return;
        }

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

    return $.html(selector);
}

function getFilename(files, name, indexFile) {
    while (name.charAt(0) === '/') {
        name = name.substr(1);
    }

    if (name.indexOf('#') >= 0) {
        name = name.split('#')[0];
    }

    if (files[name]) {
        return name;
    }

    let indexName = name;

    if (indexName && indexName.charAt(indexName.length - 1) !== '/') {
        indexName += '/';
    }

    for (const name of indexFile) {
        if (files[indexName + name]) {
            return indexName + name;
        }
    }

    return null;
}

module.exports = (options) => {
    options = pluginKit.defaultOptions({
        dest: 'book.html',
        indexFile: ['index.html', 'index.md'],
        metadata: {},
        src: [ 'index.html' ]
    }, options);

    options.indexFile = [].concat(options.indexFile);
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
                    content += processHtml(src, file, toInclude, options.dest, files, options.indexFile, options.selector);
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
