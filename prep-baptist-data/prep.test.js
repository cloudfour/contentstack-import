const {
    isArticleEligibleForImport, 
    hasWhitelistedAuthor,
    isWhitelistedAuthor,
    packageAuthors,
    packageArticles,
    authorWhitelist,
    authorMap,
    juiceAuthorType,
    juiceCategoryType,
    splitCategoriesString,
    categoryMap,
    mapCategoryNameToUid,
    packageCategories
} = require('./library');

const sourceAuthors = require('./source_data/juice-authors');

test('isArticleEligibleForImport', () => {

    const no1 = isArticleEligibleForImport({IsPublished: "1", IsActive: "0"});
    const no2 = isArticleEligibleForImport({IsPublished: "0", IsActive: "1"});
    const no3 = isArticleEligibleForImport({IsPublished: "0", IsActive: "0"});
    const yes = isArticleEligibleForImport({IsPublished: "1", IsActive: "1"});
    expect(no1).toBe(false);
    expect(no2).toBe(false);
    expect(no3).toBe(false);
    expect(yes).toBe(true);
  });

test('hasWhitelistedAuthor', () => {

    const article1 = {"CreatedByUser": "johnny.woodhouse"};
    const article2 = {"CreatedByUser": "xxxxxxx"};
    const article3 = {"CreatedByUser": "JOHNNY.woodhouse"};

    expect(hasWhitelistedAuthor(article1)).toBe(true);
    expect(hasWhitelistedAuthor(article2)).toBe(false);
    expect(hasWhitelistedAuthor(article3)).toBe(true);
    
});


test('isWhitelistedAuthor', () => {

    const author1 = {"Name": "Hetal Patel"}; //no
    const author2 = {"Name": "Wesley Roberts"}; //yes
    const author3 = {"Name": "WESLEY Roberts"}; //yes

    expect(isWhitelistedAuthor(author1)).toBe(false);
    expect(isWhitelistedAuthor(author2)).toBe(true);
    expect(isWhitelistedAuthor(author3)).toBe(true);
    
});

test('packageAuthors', () => {
    const packagedAuthors = packageAuthors(sourceAuthors);
    const firstKey = Object.keys(packagedAuthors)[0];
    expect(packagedAuthors[firstKey]["uid"]).toBe("author0");
    expect(Object.keys(packagedAuthors).length)
        .toBe(authorWhitelist.length+1);
    expect(packagedAuthors[`author${authorWhitelist.length}`].title)
        .toBe("Juice Staff");
});

test('authorMap', () => {
    const map = authorMap(authorWhitelist);
    
    expect(Object.keys(map).length).toBe(authorWhitelist.length+1);

    expect(Object.keys(map)[0]).toBe('juliette.allen');
    expect(map["juliette.allen"].fullName).toBe('Juliette Allen');
    expect(map["juliette.allen"].fakeUid).toBe('author0');
    // last item should be "juice staff"
    expect(Object.keys(map).slice(-1)[0]).toBe('juice.staff');

});

test('splitCategoriesString', () => {
    const pattern1 = "AAAAAA"; // Unmatched category
    const pattern2 = "Brain, Spine & Nerve"; // Comma name category
    const pattern3 = "Cancer"; // Simple category
    const pattern4 = "Brain, Spine & Nerve, Cancer"; // multiple categories concatenated with ","
    expect(splitCategoriesString(pattern1)).toStrictEqual([]);
    expect(splitCategoriesString(pattern2)).toStrictEqual( expect.arrayContaining(["Brain, Spine & Nerve"]));
    expect(splitCategoriesString(pattern3)).toStrictEqual( expect.arrayContaining(["Cancer"]));
    expect(splitCategoriesString(pattern4)).toStrictEqual( expect.arrayContaining(["Brain, Spine & Nerve", "Cancer"]));
});

test('mapCategoryNameToUid', () => {
    const map = categoryMap();
    const name1 = "Orthopedics, Bones & Muscles";
    const name2 = "Men's Health";
    const name3 = "FOOOOOO";
    expect(mapCategoryNameToUid(name1)).toBe(map[name1]);
    expect(mapCategoryNameToUid(name2)).toBe(map[name2]);
    expect(mapCategoryNameToUid(name3)).toBe(false);
});

test('packageCategories', () => {
    const map = categoryMap();
    const packaged = packageCategories();
    const firstKey = Object.keys(packaged)[0];
    expect(firstKey).toBe('category0');
    expect(packaged[firstKey]["title"]).toStrictEqual(Object.keys(map)[0]);
    expect(packaged[firstKey]["uid"]).toStrictEqual(firstKey);
});

test('packageArticles', () => {
    const skippedArticleTitle = 'SKIP_ME';
    const sanityCheckArticleTitle = 'FooFooMaGoo';
    const sourceArticles = [
        {   // "normal article"
            "Id": 8,
            "StoryType": "Photo",
            "Title": sanityCheckArticleTitle,
            "SubTitle": "Expectant mom who was picture of health",
            "Url": "a-joyous-birth-followed-by-a-terrifying-surgery",
            "PublicId": "journalism/images/juice-fpo-5",
            "InsetVideo": null,
            "InsetImage": "https://res.cloudinary.com/baptisthealth/image/upload/v1489175959/journalism/images/juice-fpo-5.jpg",
            "AltText": "Christina Golden ",
            "ImageCaption": "Christina Golden with her husband.",
            "Tags": null,
            "Category": "Pregnancy & Childbirth",
            "CategoryUrl": "pregnancy-childbirth",
            "ShortDescription": "One week after delivering her first child, Christina Golden was fighting for her own life",
            "HtmlDescription": "<p>Pregnant with her first child, Christina Golden was looking forward to cradling her newborn daughter, tucking her in at night and a thousand other joyful moments that come with being a new mother.</p><p>Instead, one week after giving birth, Golden was the one in need of serious care and nurturing.</p><p>Heading into her eighth month of pregnancy, the petite, 31-year-old was the picture of health. But a small mole on her temple, which she had since high school, had suddenly turned darker and bigger, and it was beginning to itch.</p><p>Golden went to the dermatologist to have the mole checked out, never imagining that she would be diagnosed with Stage III melanoma, with the cancer already spreading to one lymph node.</p><p>She needed surgery to remove the mole, but doctors didn&rsquo;t want to operate while she was pregnant. So, in Golden&rsquo;s 38th week, they performed a C-section and her daughter, Greta, came into the world.</p><p>One week later, Golden was off to surgery to remove the mole, six lymph nodes (as a precaution) and a piece of her salivary gland. She would also need facial reconstruction and four months of targeted immunotherapy at <a href=\"https://www.baptistjax.com/services/baptist-md-anderson-cancer-center\">Baptist MD Anderson Cancer Center.</a></p><p>Golden said she received overwhelming support from nurses and volunteers, who hugged her and asked about her baby as they scheduled her various appointments.</p><p>&ldquo;It didn&rsquo;t feel like a hospital,&rdquo; she said. &ldquo;When an appointment like that is made for you, you just want to crawl into a hole, but it was so warm. Because of that warmth, you just take a deep breath and push through. You know the nurses when you go and it&rsquo;s the same volunteers who bring you a sandwich and smile and pray for you and ask how you are doing.</p><p>&ldquo;At the PET scan and MRI, they were so patient and kind,&rdquo; she added. &ldquo;They cover you with a blanket and almost tuck you in. It&rsquo;s all just so caring. It just feels like your family is there. You&rsquo;ve never met these people, but you want to hug them when you leave.&rdquo;</p><p>At a fundraiser for Baptist MD Anderson, Golden and her husband, Jeff, a tennis pro in St. Augustine, walked hand in hand and mingled with the crowd. You would never know the battle they had faced and what lies ahead.</p><p>When Golden went into the hospital, an army of support rallied behind the couple at their home in Mandarin. Her mom and mother-in-law were there to help with the baby while church members and tennis friends brought meals for six weeks.</p><p>After the surgery, treatments have become the new normal. Golden finished her initial treatment in June 2016, but continues to receive 90-minute infusions every three months.</p><p>Golden said Greta has been such a good baby, as if the infant knew what her mom needed.</p><p>&ldquo;To have so many unknowns and to go home and snuggle a beautiful, peaceful baby, God knows our needs and he knows what we are capable of handling and he got us through and placed us in very credible hands at Baptist MD Anderson,&rdquo; she said.</p><p>Through all of her treatments and after her maternity leave, Golden went back to her job as a rental coordinator for a heavy equipment dealer. When she&rsquo;s home, she&rsquo;s loving on Greta and enjoying her little family.</p><p>&ldquo;She has way too much personality,&rdquo; she said of her daughter. &ldquo;She&rsquo;s just fun. You can put her in the middle of the floor and she just laughs and makes noises.</p><p>&ldquo;She came home from the hospital sleeping and she has spoiled us in every aspect of being a good baby. She has been a total dream.&rdquo;</p><p>To learn more about Baptist MD Anderson Cancer Center, go to <a href=\"https://www.baptistjax.com/services/baptist-md-anderson-cancer-center\">baptistmdanderson.com.</a></p>",
            "SequenceId": "100",
            "IsActive": "1",
            "LastUpdateUser": "johnny.woodhouse",
            "LastUpdateDateTime": "2018-03-08 11:24:26.500",
            "DatePublished": "2017-03-17 15:01:57.000",
            "PublishedByUser": "johnny.woodhouse",
            "IsPublished": "1",
            "DateCreated": "2017-03-17 15:01:57.000",
            "CreatedByUser": "johnny.woodhouse"
        },
        {   // multiple categories & weird sequenceId
            "Title": "Foo",
            "SubTitle": "Bar",
            "Url": "somestring",
            "PublicId": "journalism/images/juice-fpo-5",
            "InsetVideo": null,
            "InsetImage": null,
            "AltText": "An alt string",
            "ImageCaption": "A caption string",
            "Category": "Pregnancy & Childbirth, Wellness",
            "CategoryUrl": "pregnancy-childbirth",
            "ShortDescription": "One week after delivering ",
            "HtmlDescription": "<p>Pregnant with her first child...</p>",
            "SequenceId": "<p>Something went really wrong</p>",
            "IsActive": "1",
            "DatePublished": "2017-03-17 15:01:57.000",
            "PublishedByUser": "johnny.woodhouse",
            "IsPublished": "1",
            "CreatedByUser": "johnny.woodhouse"
        },
        {   // IsActive = 0 (so should be skipped)
            "Title": skippedArticleTitle,
            "SubTitle": "Bar",
            "Url": "somestring",
            "PublicId": "journalism/images/juice-fpo-5",
            "InsetVideo": null,
            "InsetImage": "https://example.com/photo.jpg",
            "AltText": "An alt string",
            "ImageCaption": "A caption string",
            "Category": "Pregnancy & Childbirth, Wellness",
            "CategoryUrl": "pregnancy-childbirth",
            "ShortDescription": "One week after delivering ",
            "HtmlDescription": "<p>Pregnant with her first child...</p>",
            "SequenceId": "100",
            "IsActive": "0",
            "DatePublished": "2017-03-17 15:01:57.000",
            "PublishedByUser": "johnny.woodhouse",
            "IsPublished": "1",
            "CreatedByUser": "johnny.woodhouse"
        }

    ];

    const packaged = packageArticles(sourceArticles);
    const firstPackagedArticle = packaged[Object.keys(packaged)[0]];
    const secondPackagedArticle = packaged[Object.keys(packaged)[1]];
    
    expect(firstPackagedArticle["hero_section_optional_"]["header_image"]["derived"][0]["url"]).toBe("http://res.cloudinary.com/baptisthealth/image/upload/c_limit,f_auto,h_300,q_auto,w_300/v1489175959/journalism/images/juice-fpo-5.jpg");
    expect(firstPackagedArticle["hero_section_optional_"]["header_image"])
        .toStrictEqual(expect.objectContaining(
            {
                "public_id": "journalism/images/juice-fpo-5",
                "resource_type": "image",
                "url" : "http://res.cloudinary.com/baptisthealth/image/upload/v1489175959/journalism/images/juice-fpo-5.jpg",
                "secure_url" : "https://res.cloudinary.com/baptisthealth/image/upload/v1489175959/journalism/images/juice-fpo-5.jpg",
                "altText" : "Christina Golden "
            }
        ));
    expect(firstPackagedArticle["hero_section_optional_"]["subhead"])
        .toBe("Expectant mom who was picture of health");
    expect(firstPackagedArticle["author"]).toStrictEqual(
        expect.arrayContaining(
        [
            {
                "uid" : authorMap(authorWhitelist)["johnny.woodhouse"]["fakeUid"],
                "_content_type_uid" : juiceAuthorType
            }
        ]
        )
    );
    expect(firstPackagedArticle["category"]).toStrictEqual(
        expect.arrayContaining(
            [
                {
                    "uid" : categoryMap()["Pregnancy & Childbirth"],
                    "_content_type_uid" : juiceCategoryType
                }
            ]
        )
    );
    expect(firstPackagedArticle["legacy_sequence_id"]).toBe(100);
    expect(firstPackagedArticle["legacy_image_caption"]).toBe("Christina Golden with her husband.");
    expect(firstPackagedArticle["url"]).toBe("/juice/Stories/pregnancy-childbirth/a-joyous-birth-followed-by-a-terrifying-surgery");
    
    expect(secondPackagedArticle["category"]).toStrictEqual(
        expect.arrayContaining(
            [
                {
                    "uid" : categoryMap()["Pregnancy & Childbirth"],
                    "_content_type_uid" : juiceCategoryType
                },
                {
                    "uid" : categoryMap()["Wellness"],
                    "_content_type_uid" : juiceCategoryType
                }
            ]
        )
    );
    expect(secondPackagedArticle["legacy_sequence_id"]).toBe(null);
    expect(secondPackagedArticle["hero_section_optional_"]["header_image"])
        .toStrictEqual({});

    // Testing skipping...
    let skippedTitleMatches = 0;
    let sanityCheckTitleMatches = 0;
    for (article in packaged) {
        if (packaged[article]["title"] === skippedArticleTitle) {
            skippedTitleMatches++;
        }
        if (packaged[article]["title"] === sanityCheckArticleTitle) {
            sanityCheckTitleMatches++;
        }
    }
    expect(skippedTitleMatches).toBe(0);
    expect(sanityCheckTitleMatches).toBe(1);
});