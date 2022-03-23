var express = require('express');
var router = express.Router();
const { SearchIndexClient, SearchClient, AzureKeyCredential, odata } = require("@azure/search-documents");
//import {fetch} from "node-fetch";
var fetch = require('node-fetch');

/* GET home page. */
router.get('/', async (req, res, next) => {
  try{
      // Load the .env file if it exists
    require("dotenv").config();

    // Getting endpoint and apiKey from .env file
    const endpoint = process.env.SEARCH_API_ENDPOINT || "";
    const apiKey = process.env.SEARCH_API_KEY || "";
    const indexName = "fhldocumentsearch-index2";
    const searchClient = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));
    await sendQueries(searchClient, "\"app service\"");
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

  var documents = [];
  let searchResults = await searchClient.search(text, searchOptions);
  for await (const result of searchResults.results) {
      //console.log(`${JSON.stringify(result.document)}`);
      const documentObjectCognitiveSearch = new Object();
      documentObjectCognitiveSearch.content = result.document.content;
      documentObjectCognitiveSearch.url = enrichURL(getBase64Decode(result.document.metadata_storage_path));
      documents.push(documentObjectCognitiveSearch);
        //console.log(`\n\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);

        //console.log(`${JSON.stringify(result)}`);
        //console.log(`\n\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);

        //console.log(`${JSON.stringify(result.document.content)}`);
  }
  //console.log(`${JSON.stringify(documents)}`);


  console.log(`Result count: ${searchResults.count}`);
  var summary = [];
  for (i in documents) {    
    //console.log(`\n\n\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    //console.log(`${JSON.stringify(documents[i])}`);

    console.log(`\n\n\n!!!!!!!!!!!!!!!!!!            SUMMMARY   START          !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
    var summaryResult = await queryBART({"inputs": JSON.stringify(documents[i].content)});
    //console.log(JSON.stringify(summaryResult[0].summary_text));
    const documentSummaryObject = new Object();
    documentSummaryObject.content = summaryResult;
    documentSummaryObject.url = documents[i].url;

    summary.push(documentSummaryObject);
    console.log(`Summary: ${documentSummaryObject.url}`);
    console.log(`Summary: ${JSON.stringify(documentSummaryObject).replace("\\r", "")}`);

    console.log(`\n\n\n!!!!!!!!!!!!!!!!!!            SUMMMARY  END           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
  }
  //console.log(`\n\n\n!!!!!!!!!!!!!!!!!!            FINAL RESULT           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`);
}

async function queryBART(data) {
  var result = {};
  try{
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        headers: { Authorization: "Bearer lodBKCxCllyNMHasYrwgOvcmJBPsVkBaQkpRrnOAUcRWPydUBffWKzqrHrcYwnzBFhtvpHgwBHMDtDffPRXFlOYgdLtLQDCjbSwdvIBImYBCsKYfZXZjsisFjVqWYZlC" },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    result = await response.json();
  }
  catch (err) {
    console.error(err);
  }
	return result;
}


 function getBase64Decode(urlEncoded) {
  var result = "";
  console.log(`${"decoding :" + urlEncoded}`);
  try{
    let buff = Buffer.from(urlEncoded, "base64");
    result = buff.toString('utf8');
    console.log(`${"result :" + result}`);
  }
  catch (err) {
    console.error(err);
  }
	return result;
}

 function enrichURL(url) {
  var result = url;
  try{
    if(url.slice(-1) == "5")
    {
      result = url.slice(0, -1); // remove last char
    }
    console.log(`${"result :" + result}`);
  }
  catch (err) {
    console.error(err);
  }
	return result;
}

module.exports = router;
