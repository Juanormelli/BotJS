// Para Funcionar precisa instalar as Libs 
// NPM ou YARN 
// Libs: Puppeteer xlsx lodash

const puppeteers = require("puppeteer");
const xlsx = require("xlsx")
const _ = require("lodash")


async function init() {
    
    // Functions to find the values and product names

    async function getName(page, selector) {
        const name = await page.$$eval(selector, name => name.map(name => name.innerText))
        return name
    }
    async function getPrice(page, selector) {
        const price = await page.$$eval(selector, price => price.map(price => price.innerText))
        return price
    }

    // Opening the webpage

    var internetBrowser = await puppeteers.launch({ headless: true });
    var page = await internetBrowser.newPage();
    await page.goto("https://www.amazon.com.br/", { timeout: 60000 });
    
    // Methods to search for iphone

    await page.click('[name=field-keywords]');
    await page.keyboard.type("iphone");
    await page.keyboard.press('Enter');

    // Method to wait for url update

    await page.waitForNavigation();
    
    
    // Assignment of functions to find product names and prices

    const name = await getName(page, 'div>h2>a>span.a-size-base-plus')
    const price = await getPrice(page, 'div>a>span>span.a-offscreen')
      
    //Splitting the array of objects into an array of an object to facilitate manipulation in excel 
    
    const flattenFile = _.flattenDeep(name)
    const newFile = _.chunk(flattenFile, 1)

    const flattenFilePrice = _.flattenDeep(price)
    const newFilePrice = _.chunk(flattenFilePrice, 1)

    //Creating and manipulating excel file for data control

    const ws = xlsx.utils.json_to_sheet(newFile)
    const wb = xlsx.utils.book_new()

    xlsx.utils.book_append_sheet(wb, ws, 'info_extract')
    xlsx.utils.sheet_add_json(ws, newFilePrice, { skipHeader: true, origin: "B2" })
    xlsx.writeFile(wb, "output.xlsb")


    console.log("Successfully generated file")


    //End the Browser
    
    await internetBrowser.close();

}

init();