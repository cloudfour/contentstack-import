'use strict';

const fs = require('fs');
const config = require(__dirname + '/config');
const {packageArticles, packageAuthors, packageCategories} = require(__dirname+'/library');

console.log(`MODE: ${(config.productionMode) ? 'PRODUCTION' : 'TESTING'}`);

let rawAuthorData = fs.readFileSync(config.sourceAuthorFilePath);
let rawCategoryData = fs.readFileSync(config.sourceCategoryFilePath);
let rawArticleData = fs.readFileSync(config.sourceArticleFilePath);

let authors = JSON.parse(rawAuthorData);
let categories = JSON.parse(rawCategoryData);
let articles = JSON.parse(rawArticleData);

const packagedAuthors = packageAuthors(authors);
const packagedCategories = packageCategories(categories);
const packagedArticles = packageArticles(articles);

const contentTypes = config.contentTypes;

const authorEntryDirectory = (config.productionMode) ? contentTypes.author.production : contentTypes.author.testing;
const categoryEntryDirectory = (config.productionMode) ? contentTypes.category.production : contentTypes.category.testing;
const articleEntryDirectory = (config.productionMode) ? contentTypes.article.production : contentTypes.article.testing;

// clean old files
fs.rmdirSync(config.dataDirPath+'/entries', {recursive: true});

// we write both prod and testing directories...
fs.mkdirSync(config.dataDirPath+'/entries/'+contentTypes.author.production, { recursive: true }, (err) => {if (err) throw err;});
fs.mkdirSync(config.dataDirPath+'/entries/'+contentTypes.author.testing, { recursive: true }, (err) => {if (err) throw err;});
fs.writeFileSync(`${config.dataDirPath}/entries/${authorEntryDirectory}/en-us.json`, JSON.stringify(packagedAuthors));
console.log(`Prepped ${Object.keys(packagedAuthors).length} authors`);

fs.mkdirSync(config.dataDirPath+'/entries/'+contentTypes.category.production, { recursive: true }, (err) => {if (err) throw err;});
fs.mkdirSync(config.dataDirPath+'/entries/'+contentTypes.category.testing, { recursive: true }, (err) => {if (err) throw err;});
fs.writeFileSync(`${config.dataDirPath}/entries/${categoryEntryDirectory}/en-us.json`, JSON.stringify(packagedCategories));
console.log(`Prepped ${Object.keys(packagedCategories).length} categories`);

fs.mkdirSync(config.dataDirPath+'/entries/'+contentTypes.article.production, { recursive: true }, (err) => {if (err) throw err;});
fs.mkdirSync(config.dataDirPath+'/entries/'+contentTypes.article.testing, { recursive: true }, (err) => {if (err) throw err;});
fs.writeFileSync(`${config.dataDirPath}/entries/${articleEntryDirectory}/en-us.json`, JSON.stringify(packagedArticles));
console.log(`Prepped ${Object.keys(packagedArticles).length} articles`);

// write empty {} files for the unused entries...
if (config.productionMode) {
    // empty testing entry files
    fs.writeFileSync(`${config.dataDirPath}/entries/${contentTypes.author.testing}/en-us.json`, '{}');
    fs.writeFileSync(`${config.dataDirPath}/entries/${contentTypes.category.testing}/en-us.json`, '{}');
    fs.writeFileSync(`${config.dataDirPath}/entries/${contentTypes.article.testing}/en-us.json`, '{}');
} else {
    // empty prod entry files
    fs.writeFileSync(`${config.dataDirPath}/entries/${contentTypes.author.production}/en-us.json`, '{}');
    fs.writeFileSync(`${config.dataDirPath}/entries/${contentTypes.category.production}/en-us.json`, '{}');
    fs.writeFileSync(`${config.dataDirPath}/entries/${contentTypes.article.production}/en-us.json`, '{}');
}