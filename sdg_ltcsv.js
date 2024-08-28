//sdg_ltcsv = sam dot gov link to csv
//recieves an id, navs to page and puts relevant info into a csv
const puppeteer = require('puppeteer');

//get the id from the powershell script call
const id = process.argv[2];
const url = 'https://sam.gov' + id;
console.log(url + "\n");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768});
  await page.goto(url, {waitUntil: 'networkidle2'});
  
  //todo: add timestamps to screenshots? + make optl (if this can be put on github)

  //all vars for the css here
  const popupRemoval = '.sds-dialog-actions .usa-button';
  const loaded = '.\'sam-ui-header'; //if there, then should be done loading

  //await page.screenshot({path: "sdg_inital_load.png"});
  await page.click(popupRemoval); //specific to the "ok" in the popup
  //console.log((await page.content()).indexOf("title-and-section"));
  //await page.waitForSelector(loaded);
  //await page.screenshot({path: "sdg_post_popup.png"});

  var dataArray = new Array();

  //css for the wanted info (should be $ and $eval methods? idk)
  const findTitle = '.sup.header';
  const findDeptSTO = '#header-hierarchy-level'; //need to parse bc ig its really fucking difficult to use a fucking id for specific info
  const findClosingDateUpdated = '#general-response-date'; //use if exists
  const findClosingDate = '#general-original-response-date';
  const findLastUpdate = 'sam-history';
  const findNumAttachments = 'table#opp-view-attachments-tableId>tbody';
  const findContact = 'mailto'; //same idea even if not css,, slight lie!

  //obtain title, department/subtier/office, closing date, last update, #of attachments, contact info
  //push to csv with link

  var content = await page.content();
  
  //title
  var title = content.match(new RegExp("(?<=<\/div>) .+?(?= <\/h1>)"));
  try
  {
    tempTitle = title[0].trim();
  }catch(error)
  {
    title = "error - title contains: \"" + title + "\"";
  }
  dataArray.push(title);
  
  //dept subtier office
  var depsubof = content.match(new RegExp('(?<=Department\/Ind. Agency).+?(?=<\/section>)')); //dept, subtier, office

  depsubof = depsubof[0];
  depsubof = depsubof.matchAll('(?<=class="description"> ).+?(?=<!)');
  depsubof = Array.from(depsubof);

  var dept = "\"" + depsubof[0][0] + "\"";
  dataArray.push(dept);
  var sub = "\"" + depsubof[1][0] + "\"";
  dataArray.push(sub);
  var office = "\"" + depsubof[1][0] + "\"";  
  dataArray.push(office);

  //closing date

  try {
    var closingDate = content.match(new RegExp('((?<=Updated Date Offers Due).+[[:alpha:]]{3})|((?<=Original Response Date).+[[:alpha:]]{3})|((?<=Updated Response Date).+[[:alpha:]]{3})'));
    closing = closingDate[0].match(new RegExp('(?<=->)[[:alpha:]].+'))[0];
  } catch (error) {
    closing = "error - edgecase syntax";
  }
  
  dataArray.push(closingDate);

  //just contact info for now (it is 6am (admittedly i did make breakfast though))
  //will add the other stuff later tm so i can end the hours of being almost done in my head
  var contact = content.match(new RegExp('(?<=mailto:).+?(?=")'));
  if(contact == null)
  {
    contact = "error - syntax edge case"
  }else
  {
    contact = "\"" + contact[0] + "\"";
  }
  dataArray.push(contact);
  var dataToCSV = dataArray.join(",");
  dataToCSV = dataArray + '\n';

  //console out and let ps handle write to csv lol
  console.log(dataToCSV);

  browser.close();
})();