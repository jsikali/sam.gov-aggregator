//sdg_ptl = sam dot gov proposal (id) to links
//takes an id, prints the hrefs to the proposals available
const puppeteer = require('puppeteer');

//get the id from the powershell script call
const id = process.argv[2];
//uncomment screenshots to assist debugging

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768});
  await page.goto('https://sam.gov/search', {waitUntil: 'networkidle2'});
  
  //todo: add timestamps to screenshots? + make optl (if this can be put on github)

  //all vars for the css here
  const popupRemoval = '.sds-dialog-actions .usa-button';
  const idInput = 'input.usa-input.display-inline-block[aria-label="keyword-text"]';
  const proposalSection = 'sds-search-result-list'; //so happy this is unique otherwise the css would be ASS
  const proposalPageInfo = 'sds-pagination';
  const nextPage = 'button#bottomPagination-nextPage';

  //await page.screenshot({path: "sdg_inital_load.png"});
  await page.click(popupRemoval); //specific to the "ok" in the popup
  //await page.screenshot({path: "sdg_post_popup.png"});
  await page.click(idInput); //to input id
  await page.type(idInput, id);
  //await page.screenshot({path: "sdg_ready_to_input_maybe.png"});
  await page.keyboard.press('Enter');
  //await page.screenshot({path: "sdg_searched_an_id.png"});

  //wait for the results in the sds-search-result-list element
  await page.waitForSelector(proposalSection);

  //if this screenshot isnt taken
  //the regex below to get the number of pages fails
  //?? idk idk i do not fucking know
  await page.screenshot({path: "sdg_ready_to_scrape.png"});

  //get the page count for html dumping
  var source = await page.content();
  //console.log(source);

  //find the number of pages, then index that to console log out

  //gets the page nav part of the html
  var start = source.indexOf(`<${proposalPageInfo}`);
  var end = source.indexOf(`</${proposalPageInfo}>`);
  //console.log(start + " " + end);
  source = source.slice(start, end); //currently just the tag contents w/wanted info

  //regex nonsense to extract numbers
  const re_numstr = new RegExp("\\d - \\d+ of \\d+"); //looking for the start through end of total entries string
  //console.log(source);
  //console.log(source.match(re_numstr)[0]);
  var it = (source.match(re_numstr)[0]).matchAll("\\d+");
  it.next(); //this isn't used, go past

  //gets the number of pages from (total proposals)/(proposals per page)
  var ppp = it.next().value[0];
  var tp = it.next().value[0]; //should be done here. if not, :(
  var proposalPageCount = Math.ceil(tp/ppp);

  //now use sds-pagination to dump html for each page
  const re_findhref = new RegExp("class=\"usa-link\" href.*?\">");
  const re_href = new RegExp("\/.*(?=\")");
  for(var i = 1; i <= proposalPageCount; i++)
  {
    //nav to next page
    await page.waitForSelector(proposalSection);
    source = await page.content();
    var matches = source.matchAll("class=\"usa-link\" href.*?\">"); //its just re_findhref but global error (????)
    //console.log(`\npage ${i}\n`);
    for (var match of matches)
    {
      result = new String(match);
      result = result.match(re_href);
      console.log(result[0]); //lfg
    }
    //await page.screenshot({path: `sdg_post_content_dump${i}.png`});
    await page.click(nextPage);
  }

  browser.close();
})();