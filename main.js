const puppeteer = require('puppeteer');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

class DirectoryTreeNode {
    constructor(url) {
        this.url = url;
        this.children = null;
    }
}

class Site {
    constructor(base_url,browser) {
        this.browser = browser;
        this.base_url = base_url;
        this.tree = new DirectoryTreeNode(base_url);
    }
}

async function get_children(node,callback) {
  //creates a copy of callback bound to Site instance
  const bound_callback = callback.bind(this)
  // This call creates requirement for node argument in any callback method passed
  await bound_callback(node);
}
Site.prototype.get_children = get_children;

async function get_subdirectory_links(node) {
    const page = await this.browser.newPage();
    const main_directory = 'https://www.guidestar.org/NonprofitDirectory.aspx'
    await page.goto(main_directory);
    const handle = await page.waitForSelector('#ctl00_phMainBody_listCategoryNav');
    const subdirectory_paths = await handle.$$eval('ul > li > a',nodes => nodes.map(node => node.href));
    node.children = new Set(
      subdirectory_paths
      .filter(url => url != 'https://www.guidestar.org/NonprofitDirectory.aspx#')
      .map(url => new DirectoryTreeNode(url.replace('/1.aspx','')))
    );
    await page.close();
}

async function get_entity_pages(node) {
  const testvals = [1];
  let pages = new Set();
  for(const page_number of testvals) {
    pages.add(this.browser.newPage().then(page => {
        const sub_directory = `${node.url}/${page_number}.aspx`
        console.log(sub_directory);
        page.goto(sub_directory).then(() => page.waitForSelector('.half-space').then(handle =>{
            handle.$$eval('li > a',nodes => nodes.map(node => node.href)).then(subdirectory_paths => {
                subdirectory_paths.forEach(path => pages.add(path));
            });
        })
        .then(node.children = sundirectory_paths))
        .catch(err => {
            console.log(typeof(err));
        });
    }));
  }
  await Promise.all(pages);
}

async function scrape(){
    const base_url = 'https://www.guidestar.org/'
    
    const browser = await puppeteer.launch();
    // Initiailize site
    let site = new Site(base_url,browser);
    // Build tree
   await site.get_children(site.tree,get_subdirectory_links);
   let sub_directories = site.tree.children;
   let entities = new Set();
   for (let sub_directory of sub_directories) {
       site.get_children(sub_directory,get_entity_pages).then(() => {

       });
   }
   //console.log(site);
}

async function main(){
    scrape();
}

main();