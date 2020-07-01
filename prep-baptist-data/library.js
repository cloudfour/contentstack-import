const config = require(__dirname+'/config');

const juiceAuthorType = (config.productionMode) ? config.contentTypes.author.production : config.contentTypes.author.testing; // juice_author
const juiceArticleType = (config.productionMode) ? config.contentTypes.article.production : config.contentTypes.article.testing; // juice_article
const juiceCategoryType = (config.productionMode) ? config.contentTypes.category.production : config.contentTypes.category.testing;
const juiceStaffPropertyName = 'juice.staff';

// Anyone not on this list becomes "Juice Staff"
// https://cloudfour.slack.com/archives/C3026EH5J/p1576174162445200
const authorWhitelist = [
    // there seem to be different case versions of usernames so 
    // we're making the search list case-insenstive
    "juliette.allen",
    "wesley.roberts",
    "johnny.woodhouse",
    "emilie.pennington",
    "beth.stambaugh",
    "janine.landowski",
    "cynthia.klusmeyer",
    "vikki.mioduszewski",
    "carolyn.tillo"
];

const categoryNameList = [
    "Aging Well",
    "Brain, Spine & Nerve",
    "Cancer",
    "Child Health",
    "Community Health",
    "Diabetes",
    "Ear, Nose & Throat",
    "Heart & Vascular",
    "Lungs, Breathing & Sleep",
    "Mental Health",
    "Orthopedics, Bones & Muscles",
    "Pregnancy & Childbirth",
    "Primary Care",
    "Wellness",
    "Women’s Health",
    "Men's Health"
];


const hasWhitelistedAuthor = (article) => {
    if ( authorWhitelist.indexOf(article.CreatedByUser.toLowerCase() ) === -1) {
        return false;
    }
    return true;
}

const isWhitelistedAuthor = (author) => {
    const normalizedName = author.Name
        .split(' ')
        .map( (chunk) => chunk.toLowerCase() )
        .join(".");
    if ( authorMap(authorWhitelist).hasOwnProperty(normalizedName)) {
        return true;
    }
    return false;
}

const isArticleEligibleForImport = (article) => {
    const isPublished = (article.IsPublished === "1"); // note this is a string NOT bool
    const isActive = (article.IsActive === "1");
    return (isPublished && isActive) ? true : false;
};

const packageAuthors = (oldAuthors) => {
    const newAuthors = {};
    const authors = authorMap(authorWhitelist);
    for (author in authors) {
        newAuthors[authors[author].fakeUid] = {
            "title" : authors[author].fullName,
            "uid" : authors[author].fakeUid
        }
    }
    return newAuthors;
};

const splitCategoriesString = (string) => {
    if (!string) { return []; }
    const pattern = new RegExp("("+categoryNameList.join(")|(")+")", "g");
    return string.match(pattern) || [];
};

const packageCategories = () => {
    const newCategories = {};
    const categories = categoryMap(categoryNameList);
    for (category in categories) {
        newCategories[categories[category]] = {
            "title" : category,
            "uid" : categories[category]
        }
    }
    return newCategories;
};

const categoryMap = () => {
    const categoryKey = (n) => `category${n}`; //this may need to come out
    let categoryMap = {};
    for (let i=0; i<categoryNameList.length; i++) {
        const item = categoryNameList[i];
        categoryMap[item] = categoryKey(i)
    }
    return categoryMap;
}
const mapCategoryNameToUid = (name) => {
    const map = categoryMap(categoryNameList);
    if (map.hasOwnProperty(name)) {
        return map[name];
    } else {
        return false;
    }
}; 


const packageArticles = (old) => {
    const articleKey = (n) => `article${n}`;
    const neww = {};
    let i = 0;
    old.forEach( (item) => {
        if (!isArticleEligibleForImport(item)) {return;}
        neww[articleKey(i)] = {
            "title" : item.Title,
            "description" : item.ShortDescription,
            "main_content" : item.HtmlDescription,
            // "created_at" : item.DateCreated.slice(0, item.DateCreated.indexOf(' ')),
            "uid" : articleKey(i),
            "author" : [
                {
                    "uid" : mapAuthorUsernameToUid(item.CreatedByUser),
                    "_content_type_uid" : juiceAuthorType
                }
            ],
            "category" : splitCategoriesString(item.Category)
                            .map( (cat) => {
                                return { 
                                    "uid" : mapCategoryNameToUid(cat),
                                    "_content_type_uid" : juiceCategoryType
                                }
                            }),
            "legacy_sequence_id" : parseInt(item.SequenceId) || null,
            "hero_section_optional_": {
                "subhead": item.SubTitle || null,
                "header_image": buildCloudinaryFields(item),
                "intro_content": ""
            },
            "legacy_image_caption": item.ImageCaption || null,
            "url" : buildArticleUrl(item),
            "legacy_publication_date": trimDateTime(item.DatePublished) //DatePublished is absent if unpublished
        };
        i++;
    } );
    return neww;
};

const trimDateTime = (datetime) => datetime ? datetime.split('T')[0] : null;

const buildArticleUrl = (article) => {
    return "/juice/Stories/" + article.CategoryUrl + '/' + article.Url;
};

const buildCloudinaryFields = (article) => {
    const urlWithDerivedSegment = (url, segment) => url.replace("/upload", "/upload"+segment);
    const urlWithoutProtocol = (url) => url.split("://")[1];
    return (article.InsetImage) ? {
        "public_id": article.PublicId,
        "resource_type": "image",
        "type": null,
        "format": null,
        "version": null,
        "url" : "http://" + urlWithoutProtocol(article.InsetImage),
        "secure_url" : "https://" + urlWithoutProtocol(article.InsetImage),
        "width": null,
        "height": null,
        "bytes": null,
        "duration": null,
        "tags": [],
        "metadata": [],
        "created_at": null,
        "derived" : [
            {
                "url": "http://" + urlWithDerivedSegment(urlWithoutProtocol(article.InsetImage), "/c_limit,f_auto,h_300,q_auto,w_300"),
                "secure_url":"https://" + urlWithDerivedSegment(urlWithoutProtocol(article.InsetImage), "/c_limit,f_auto,h_300,q_auto,w_300"),
                "raw_transformation": "c_limit,f_auto,h_300,q_auto,w_300"
            },
            {
                "url": "http://" + urlWithDerivedSegment(urlWithoutProtocol(article.InsetImage), "/f_auto,q_auto"),
                "secure_url": "https://" + urlWithDerivedSegment(urlWithoutProtocol(article.InsetImage), "/f_auto,q_auto"),
                "raw_transformation": "f_auto,q_auto"
            }
    ],
        "altText" : article.AltText || null,
        "breakpoints" : []
    } : {}
};

const mapAuthorUsernameToUid = (username) => {
    const lowercaseUsername = username.toLowerCase();
    const map = authorMap(authorWhitelist);
    if (map.hasOwnProperty(lowercaseUsername)) {
        return map[lowercaseUsername].fakeUid;
    } else {
        return map[juiceStaffPropertyName].fakeUid;
    }
}; 

const authorKey = (n) => `author${n}`;
const authorMap = (authorWhitelist) => {
    let authorMap = {};
    for (let i=0; i<authorWhitelist.length; i++) {
        const item = authorWhitelist[i];
        authorMap[item] = {
            fullName: item.split('.').map( (part) => capitalize(part) ).join(' '), //@todo
            fakeUid: authorKey(i)
        }
    }
    authorMap[juiceStaffPropertyName] = {
        fullName: 'Juice Staff',
        fakeUid: authorKey(Object.keys(authorMap).length)
    }
    return authorMap;
}

// Thanks Flavio... https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

module.exports = {
    packageArticles,
    packageCategories,
    packageAuthors,

    // exported for convenient testing
    isArticleEligibleForImport, 
    hasWhitelistedAuthor,
    isWhitelistedAuthor,
    authorWhitelist,
    authorMap,
    juiceAuthorType,
    juiceArticleType,
    juiceCategoryType,
    categoryNameList,
    splitCategoriesString,
    mapCategoryNameToUid,
    categoryMap
};