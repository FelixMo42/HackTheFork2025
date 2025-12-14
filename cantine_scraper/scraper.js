const puppeteer = require('puppeteer');
const fs = require('fs');

// Configuration
const BASE_URL = 'https://ma-cantine.agriculture.gouv.fr/nos-cantines/';
const MAX_PAGES = null; // Set to null to scrape all pages, or a number to limit
const OUTPUT_FILE = 'canteens_data.json';
const DELAY_BETWEEN_PAGES = 2000; // milliseconds

/**
 * Extract structured data from canteen card
 */
function parseCanteenData(rawText, allTextArray) {
  const data = {
    city: null,
    meals: null,
    sector: null,
    managementType: null,
    bioPercentage: null,
    qualityPercentage: null,
    year: null,
    restaurantType: null,
    satelliteCount: null
  };

  allTextArray.forEach(text => {
    const cleanText = text.trim();
    
    // Extract city (usually appears early, single word or hyphenated)
    if (!data.city && cleanText.length > 2 && cleanText.length < 50 && 
        !cleanText.includes('couverts') && !cleanText.includes('%') &&
        !cleanText.match(/^(Enseignement|Administration|Entreprise|Social|Médico-Social|Santé)/)) {
      // Check if it looks like a city name
      if (cleanText.match(/^[A-ZÀ-ÿ][a-zà-ÿ-]+(\s[A-ZÀ-ÿ][a-zà-ÿ-]+)*$/) || 
          cleanText.match(/^[A-ZÀ-ÿ][a-zà-ÿ-]+-[A-ZÀ-ÿ][a-zà-ÿ-]+/)) {
        data.city = cleanText;
      }
    }
    
    // Extract number of meals
    if (cleanText.includes('couverts')) {
      const match = cleanText.match(/(\d+)\s*couverts/);
      if (match) data.meals = parseInt(match[1]);
    }
    
    // Extract sector
    if (cleanText.match(/^(Enseignement|Administration|Entreprise|Social et Médico-Social|Santé|Petite enfance)/)) {
      data.sector = cleanText;
    }
    
    // Extract management type
    if (cleanText.match(/^Gestion (directe|concédée)/)) {
      data.managementType = cleanText;
    }
    
    // Extract bio percentage
    if (cleanText.includes('% bio')) {
      const match = cleanText.match(/(\d+)\s*%\s*bio/);
      if (match) data.bioPercentage = parseInt(match[1]);
    }
    
    // Extract quality percentage
    if (cleanText.includes('% de qualité et durables')) {
      const match = cleanText.match(/(\d+)\s*%\s*de qualité et durables/);
      if (match) data.qualityPercentage = parseInt(match[1]);
    }
    
    // Extract year
    if (cleanText.match(/^En \d{4}/)) {
      const match = cleanText.match(/En (\d{4})/);
      if (match) data.year = parseInt(match[1]);
    }
    
    // Extract restaurant type
    if (cleanText.match(/^(Cuisine centrale|Restaurant satellite)/)) {
      data.restaurantType = cleanText;
    }
    
    // Extract satellite count
    if (cleanText.includes('restaurants satellites')) {
      const match = cleanText.match(/(\d+)\s*restaurants satellites/);
      if (match) data.satelliteCount = parseInt(match[1]);
    }
  });

  return data;
}

/**
 * Main scraping function
 */
async function scrapeCanteens() {
  console.log('Starting canteen scraper...');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Max pages: ${MAX_PAGES || 'unlimited'}\n`);
  
  // Try to load existing data to resume if crashed
  let allCanteens = [];
  let startPage = 1;
  
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      if (existingData.length > 0) {
        allCanteens = existingData;
        const lastPage = Math.max(...existingData.map(c => c.pageNumber || 0));
        startPage = lastPage + 1;
        console.log(`📂 Found existing data: ${existingData.length} canteens from ${lastPage} pages`);
        console.log(`🔄 Resuming from page ${startPage}\n`);
      }
    } catch (error) {
      console.log('⚠️  Could not load existing data, starting fresh\n');
    }
  }
  
  const browser = await puppeteer.launch({
    headless: 'new', // Use new headless mode
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set user agent to avoid detection
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  let currentPage = startPage;
  let hasMorePages = true;

  try {
    while (hasMorePages && (MAX_PAGES === null || currentPage <= MAX_PAGES)) {
      const url = `${BASE_URL}?page=${currentPage}&trier=creationCro`;
      console.log(`Scraping page ${currentPage}: ${url}`);
      
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });

      // Wait for canteen listings to load
      try {
        await page.waitForSelector('.canteen-card', { timeout: 10000 });
      } catch (error) {
        console.log('No canteen cards found. Reached the end.');
        hasMorePages = false;
        break;
      }

      // Extract canteen data from the page
      const canteensOnPage = await page.evaluate(() => {
        const canteens = [];
        const cards = document.querySelectorAll('.canteen-card');

        cards.forEach((card, index) => {
          try {
            const canteen = {
              pageNumber: null,
              pageIndex: index
            };
            
            // Extract name
            const titleEl = card.querySelector('h2, h3, .title, [class*="title"]');
            if (titleEl) {
              canteen.name = titleEl.innerText.trim();
            }
            
            // Extract link
            const linkEl = card.querySelector('a[href]');
            if (linkEl) {
              canteen.url = linkEl.href;
            }
            
            // Extract all text content
            const allText = card.innerText || card.textContent || '';
            canteen.rawText = allText.trim();
            
            // Extract individual text elements
            const textElements = card.querySelectorAll('p, span, div:not(:has(*))');
            const textData = [];
            textElements.forEach(el => {
              const text = el.innerText?.trim();
              if (text && text.length > 0 && text.length < 300 && !text.includes('\n\n')) {
                textData.push(text);
              }
            });
            canteen.allText = textData;
            
            // Extract the 5 compliance flags from badge images
            const badges = {
              qualityProducts: false,      // Qualité des produits (appro)
              wasteReduction: false,       // Lutte contre le gaspillage (waste)
              vegetarianMenus: false,      // Menus végétariens (diversification)
              plasticBan: false,           // Interdiction du plastique (plastic)
              consumerInfo: false          // Information des convives (info)
            };
            
            // Check badge images for enabled/disabled state
            // Badges are enabled if they DON'T have '-disabled' in the filename
            const badgeImages = card.querySelectorAll('img[src*="/badges/"]');
            badgeImages.forEach(img => {
              const src = img.src;
              const isEnabled = !src.includes('-disabled.svg');
              
              if (src.includes('appro')) {
                badges.qualityProducts = isEnabled;
              } else if (src.includes('waste')) {
                badges.wasteReduction = isEnabled;
              } else if (src.includes('diversification')) {
                badges.vegetarianMenus = isEnabled;
              } else if (src.includes('plastic')) {
                badges.plasticBan = isEnabled;
              } else if (src.includes('info')) {
                badges.consumerInfo = isEnabled;
              }
            });
            
            canteen.badges = badges;
            
            if (canteen.name || canteen.url) {
              canteens.push(canteen);
            }
          } catch (error) {
            console.error('Error extracting canteen:', error);
          }
        });

        return canteens;
      });

      // Parse structured data for each canteen
      canteensOnPage.forEach(canteen => {
        canteen.pageNumber = currentPage;
        const parsed = parseCanteenData(canteen.rawText, canteen.allText);
        Object.assign(canteen, parsed);
      });

      console.log(`  ✓ Found ${canteensOnPage.length} canteens`);
      allCanteens = allCanteens.concat(canteensOnPage);

      // Save incrementally after each page
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allCanteens, null, 2));
      console.log(`  💾 Saved ${allCanteens.length} canteens to ${OUTPUT_FILE}`);

      // Check if there's a next page by looking at pagination
      const paginationInfo = await page.evaluate(() => {
        // Look for pagination elements
        const paginationText = document.body.innerText;
        const match = paginationText.match(/Page\s+(\d+)\s+sur\s+(\d+)/i);
        if (match) {
          return {
            current: parseInt(match[1]),
            total: parseInt(match[2])
          };
        }
        
        // Alternative: check for next button
        const nextButton = document.querySelector('button[aria-label*="suivant"], a[aria-label*="suivant"], .pagination .next');
        return {
          hasNext: nextButton && !nextButton.disabled && !nextButton.classList.contains('disabled')
        };
      });

      console.log(`  Pagination info:`, paginationInfo);

      // Determine if we should continue
      if (paginationInfo.total && currentPage >= paginationInfo.total) {
        console.log(`  Reached last page (${paginationInfo.total})`);
        hasMorePages = false;
      } else if (paginationInfo.hasNext === false) {
        console.log(`  No next button found`);
        hasMorePages = false;
      } else if (canteensOnPage.length === 0) {
        console.log(`  No canteens found on this page`);
        hasMorePages = false;
      } else {
        currentPage++;
        console.log(`  Waiting ${DELAY_BETWEEN_PAGES}ms before next page...\n`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_PAGES));
      }
    }

    // Final save and summary
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Total canteens scraped: ${allCanteens.length}`);
    console.log(`Total pages scraped: ${currentPage}`);
    console.log(`Final data saved to: ${OUTPUT_FILE}`);
    
    // Generate summary statistics
    const stats = {
      total: allCanteens.length,
      withMeals: allCanteens.filter(c => c.meals).length,
      withBio: allCanteens.filter(c => c.bioPercentage).length,
      sectors: {}
    };
    
    allCanteens.forEach(c => {
      if (c.sector) {
        stats.sectors[c.sector] = (stats.sectors[c.sector] || 0) + 1;
      }
    });
    
    console.log('\n=== Summary Statistics ===');
    console.log(`Canteens with meal data: ${stats.withMeals}`);
    console.log(`Canteens with bio percentage: ${stats.withBio}`);
    console.log(`Sectors:`, stats.sectors);
    
    if (allCanteens.length > 0) {
      console.log('\n=== Sample Canteen ===');
      console.log(JSON.stringify(allCanteens[0], null, 2));
    }

  } catch (error) {
    console.error('\n❌ Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('\n✓ Browser closed. Scraping complete!');
  }
}

// Run the scraper
scrapeCanteens().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
