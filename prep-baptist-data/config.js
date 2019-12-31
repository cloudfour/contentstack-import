const authorsFileName = 'juice-authors.json';
const categoriesFileName = 'juice-category.json';
const articlesFileName = 'juice-patient-stories.json';

const contentTypes = {
    author: {
        production: 'juice_author',
        testing: 'juice_author_import_testing'
    },
    category: {
        production: 'juice_category',
        testing: 'juice_category_import_testing',
    },
    article: {
        production: 'juice_article',
        testing: 'juice_article_import_testing'
    }
};

exports.productionMode = false;

exports.dataDirPath = './data';
exports.contentTypes = contentTypes;
exports.sourceAuthorFilePath = `./prep-baptist-data/source_data/${authorsFileName}`;
exports.sourceCategoryFilePath = `./prep-baptist-data/source_data/${categoriesFileName}`;
exports.sourceArticleFilePath = `./prep-baptist-data/source_data/${articlesFileName}`;