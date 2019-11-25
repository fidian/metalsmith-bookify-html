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

- **`indexFile`** `String`, default `index.html`

    When a link is to a folder, the plugin will automatically attempt to scan for an index file with this name.

- **`src`** `String|Array<String>`, default `index.html`

    Files to be included in the book as a starting point. All local links within the book are scanned as well.

## License

MIT License, see [LICENSE](https://github.com/christophercliff/metalsmith-less/blob/master/LICENSE.md) for details.
