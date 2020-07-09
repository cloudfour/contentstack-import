# Contentstack import utility FORK

This is a fork of [contentstack/contentstack-import](https://github.com/contentstack/contentstack-import) which we've hacked to include a pre-processing script which converts an exported database dump into the structure/format compatible with Contentstack's import tool.

For import functionality, see [the original README](https://github.com/contentstack/contentstack-import/blob/master/README.md)...

## Setup

* `nvm use` (Tested on node version 14...) 
* `npm install`
* `mv config/index.example.js config/index.js` ...and then update credentials

## Updating the source data
* Kamran will likely deliver a CSV file exported from this query: `SELECT * FROM PatientStories ORDER BY DatePublished DESC`
* Check that the column names match
* Use [https://csvjson.com/csv2json](https://csvjson.com/csv2json) to convert the CSV to JSON
* Do not check "parse numbers" or "parse json" 
* Look for artifacts like `"NULL"` (string versions of javascript constructs). Fix this with search/replace?
* Look for wonkiness with quotes in strings. Ex: `"Code Stroke: \"I didn't have the classic symptoms"`
* Update file paths in `prep-baptist-data/config.js` (if the new JSON file names differ)
* Consider checking DB dump data 

## Usage

* `npm run prep` will read the files from source_data/ and write to output_data/
* `npm run test` will run the test suite

## Import Sequence Checklist
1. Update `productionMode` variable in `prep-baptist-data/config.js`
1. Run `npm run test` to make sure nothing broke
1. Run `npm run prep` to build new data files
1. Double-check that article reference fields point to NON *IMPORT versions
1. `npm run import`
1. Consider updating the references in CS to REMOVE *_import_testing options

NOTE: Lots of vague errors in the console are normal. Usual suspects:

```
error: Success file was not found at: /Users/emerson/Code/contentstack-import/_backup_841/mapper/entries/en-us/juice_article/success.json
```
```
error: Entry Uid: blt52843cdac9ead162 of Content Type: juice_article_import_testing failed to update in locale: en-us
error: {"error_message":"Entry update failed.","error_code":121,"errors":{"title":["is not unique."]}}
```

^ Neither of these appear to indicate that a problem actually happened.
