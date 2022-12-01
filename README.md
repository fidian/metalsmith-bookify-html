# metalsmith-bookify-html

Combine several HTML files into one. Updates links to images and changes links to pages to use anchors.

## Installation

```
npm install metalsmith-bookify-html
```

## Usage

```js
var bookifyHtml = require('metalsmith-bookify-html');

new Metalsmith(__dirname)
    .use(bookifyHtml(options))
    .build()
```

### **`options`** `Object`

- **`dest`** `String`, default `book.html`

    Where the file will be written.

- **`indexFile`** `String` or `String[]`, default `["index.html", "index.md"]`

    When a link is to a folder, the plugin will automatically attempt to scan for an index file with these names. Even though the name could end in `.md`, it must be an HTML file.

- **`metadata`** `Object`, default `{}`

    Sets these metadata properties on the destination file. Useful for template systems, file processing filters, etc.

- **`selector`** `String`, default `body`

    The CSS selector to use for finding the content to append. The target element will not be included, just its `innerHTML`.

- **`src`** `String|Array<String>`, default `index.html`

    Files to be included in the book as a starting point. All local links within the book are scanned as well.

## License

MIT License, see [LICENSE](https://github.com/christophercliff/metalsmith-less/blob/master/LICENSE.md) for details.
