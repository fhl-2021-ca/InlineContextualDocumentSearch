var express = require('express');
var router = express.Router();
const { SearchIndexClient, SearchClient, AzureKeyCredential, odata } = require("@azure/search-documents");

/* GET home page. */
router.get('/', async (req, res, next) => {
  try{
      // Load the .env file if it exists
    require("dotenv").config();

    // Getting endpoint and apiKey from .env file
    const endpoint = process.env.SEARCH_API_ENDPOINT || "";
    const apiKey = process.env.SEARCH_API_KEY || "";
    const indexName = "fhldocumentsearch-index";
    const searchClient = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));
    await sendQueries(searchClient, "azure");
    res.render('index', { title: 'Express' });
  }
  catch (err) {
    console.error(err);
    next(err);
  }
});


 async function sendQueries(searchClient, text) {
  console.log('Query #1 - search everything:');
  let searchOptions = {
      includeTotalCount: true,
  };

  let searchResults = await searchClient.search(text, searchOptions);
  for await (const result of searchResults.results) {
      //console.log(`${JSON.stringify(result.document)}`);
  }
  console.log(`Result count: ${searchResults.count}`);

  // remaining queries go here
}


module.exports = router;
