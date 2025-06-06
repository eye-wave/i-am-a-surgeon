import type { MinifyOptions } from "terser"
import type { Options as HtmlMinifyOptions } from "html-minifier-terser"

export const HTML_MINIFY_OPTIONS: HtmlMinifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true,
  removeOptionalTags: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true,
  sortAttributes: true,
  sortClassName: true,
  caseSensitive: true,
  quoteCharacter: '"',
  html5: true,
  continueOnParseError: false,
  keepClosingSlash: false,
  decodeEntities: true,
  collapseBooleanAttributes: true,
  minifyURLs: true,
  removeAttributeQuotes: true,
}

export const JS_MINIFY_OPTIONS: MinifyOptions = {
  toplevel: true,
  compress: {},
  mangle: true,
  ecma: 2020,
  format: {
    comments: false,
  },
}
