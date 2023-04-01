# Supercharge Knowledge Extraction

- Extension supporting most modern browsers
- No additional server needed (other than Inference endpoint)
- Made with https://github.com/fregante/browser-extension-template

## Quickstart

1. npm run build
2. web-ext run -t chromium

## I want to run on firefox

1. Skip step 2 above.
2. Copy over "manifest_ff_v3.json" to "dsitribution/manifest.json". You might have to modify the file names to their temp counterparts.
3. If FF hasn't shipped v3 yet, enable it by reading https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/
4. Load the extension in firefox from `about:debugging`.

## FAQ

1. Why 2 manifest files?
   - Because ff and chrome have different manifest files...even in v3....
2. Why don't you pin the extension automagically after install?
   - Chrome doesn't allow it
3. Why does this look so ugly?
   - I'm not a frontend dev :)

## License

 <TODO>
