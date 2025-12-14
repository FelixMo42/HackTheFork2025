# French Canteen Scraper

A web scraping tool using Puppeteer to extract canteen data from the French government website [ma-cantine.agriculture.gouv.fr](https://ma-cantine.agriculture.gouv.fr/nos-cantines/).

## Features

- ✅ **Automated pagination** - Scrapes all pages automatically
- ✅ **Incremental saving** - Saves data after each page to prevent data loss
- ✅ **Auto-resume capability** - Automatically resumes from last page if interrupted
- ✅ **Structured data extraction** - Parses all varying fields between canteens
- ✅ **5 Compliance badges** - Captures sustainability and quality indicators:
  - Quality products (Qualité des produits)
  - Waste reduction (Lutte contre le gaspillage)
  - Vegetarian menus (Menus végétariens)
  - Plastic ban (Interdiction du plastique)
  - Consumer information (Information des convives)
- ✅ **Comprehensive data capture** including:
  - Canteen name
  - City/Location
  - Number of meals (couverts)
  - Sector (Enseignement, Administration, Entreprise, etc.)
  - Management type (Gestion directe/concédée)
  - Bio percentage
  - Quality and sustainable food percentage
  - Year of data
  - Restaurant type (Cuisine centrale, Restaurant satellite)
  - Number of satellite restaurants
  - Direct URLs to each canteen
- ✅ **Respectful scraping** - 2-second delays between requests
- ✅ **Headless mode** - Runs in background by default
- ✅ **Error handling** - Robust error handling and logging
- ✅ **Summary statistics** - Generates statistics after scraping

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Install dependencies:
```bash
npm install
```

This will install Puppeteer and its dependencies (including Chromium browser).

## Usage

### Basic Usage

Run the scraper with default settings (scrapes all pages):
```bash
npm start
```

Or directly with Node:
```bash
node scraper.js
```

### Configuration

You can modify the following settings in `scraper.js`:

```javascript
const MAX_PAGES = null; // Set to a number to limit pages, or null for all pages
const OUTPUT_FILE = 'canteens_data.json'; // Output filename
const DELAY_BETWEEN_PAGES = 2000; // Delay in milliseconds between page requests
```

**Examples:**
```javascript
// Scrape only first 5 pages
const MAX_PAGES = 5;

// Change output file
const OUTPUT_FILE = 'my_canteens.json';

// Reduce delay (be respectful!)
const DELAY_BETWEEN_PAGES = 1000;
```

To run with visible browser (for debugging):
```javascript
const browser = await puppeteer.launch({
  headless: false, // Change 'new' to false
  // ...
});
```

## Output

The scraper generates a JSON file (`canteens_data.json` by default) containing an array of canteen objects with structured data:

```json
{
  "pageNumber": 1,
  "pageIndex": 0,
  "name": "Cantine de Misson",
  "url": "https://ma-cantine.agriculture.gouv.fr/nos-cantines/14--Cantine%2520de%2520Misson",
  "rawText": "Full raw text from the card...",
  "allText": ["Array", "of", "text", "elements"],
  "city": "Misson",
  "meals": 45,
  "sector": "Enseignement",
  "managementType": "Gestion directe",
  "bioPercentage": 73,
  "qualityPercentage": 3,
  "year": 2024,
  "restaurantType": "Cuisine centrale",
  "satelliteCount": 12
}
```

### Data Fields Explained

| Field | Description | Example |
|-------|-------------|---------|
| `name` | Canteen name | "Cantine de Misson" |
| `url` | Direct link to canteen page | "https://..." |
| `city` | City/Location | "Misson" |
| `meals` | Number of meals served | 45 |
| `sector` | Type of establishment | "Enseignement", "Administration" |
| `managementType` | Management style | "Gestion directe", "Gestion concédée" |
| `bioPercentage` | % of organic food | 73 |
| `qualityPercentage` | % of quality/sustainable food | 3 |
| `year` | Year of data | 2024 |
| `restaurantType` | Central kitchen or satellite | "Cuisine centrale" |
| `satelliteCount` | Number of satellite restaurants | 12 |
| `pageNumber` | Page number where found | 1 |
| `pageIndex` | Position on the page | 0 |

### Compliance Badges

Each canteen has 5 compliance badges that indicate whether they meet certain sustainability and quality standards:

| Badge Field | Description | French Name |
|-------------|-------------|-------------|
| `badges.qualityProducts` | Quality and sustainable products | Qualité des produits |
| `badges.wasteReduction` | Food waste reduction efforts | Lutte contre le gaspillage |
| `badges.vegetarianMenus` | Vegetarian menu options | Menus végétariens |
| `badges.plasticBan` | Plastic-free initiative | Interdiction du plastique |
| `badges.consumerInfo` | Consumer information transparency | Information des convives |

Each badge is a boolean value (`true` = achieved, `false` = not achieved).

## How It Works

1. **Launch Browser** - Starts Puppeteer with Chromium in headless mode
2. **Navigate** - Goes to the canteen listing page with sorting parameters
3. **Wait for Content** - Waits for canteen cards to load
4. **Extract Data** - Scrapes all canteen information from the page
5. **Parse Fields** - Intelligently extracts structured data from text
6. **Check Pagination** - Determines if more pages exist
7. **Repeat** - Continues until all pages are scraped
8. **Save & Summarize** - Saves JSON file and displays statistics

## Example Output

After running, you'll see:

```
Starting canteen scraper...
Target: https://ma-cantine.agriculture.gouv.fr/nos-cantines/
Max pages: unlimited

Scraping page 1: https://...
  ✓ Found 15 canteens
  Pagination info: { hasNext: true }
  Waiting 2000ms before next page...

Scraping page 2: https://...
  ✓ Found 15 canteens
  ...

==================================================
Total canteens scraped: 45
Total pages scraped: 3
Data saved to: canteens_data.json

=== Summary Statistics ===
Canteens with meal data: 37
Canteens with bio percentage: 27
Sectors: {
  Entreprise: 2,
  Enseignement: 26,
  Administration: 14
}
```

## Notes

- The scraper runs in **headless mode** by default (no visible browser)
- A **2-second delay** is added between page requests to be respectful to the server
- **Incremental saving**: Data is saved after each page, so you won't lose progress if the scraper crashes
- **Auto-resume**: If interrupted, simply run the scraper again and it will automatically resume from the last completed page
- The script automatically handles different HTML structures
- All varying fields between canteens are captured and parsed
- Empty/missing fields are set to `null` for consistency
- The 5 compliance badges are captured as boolean values (true/false)

## Troubleshooting

**Issue: Puppeteer installation fails**
```bash
npm install puppeteer --unsafe-perm=true
```

**Issue: No data extracted**
- The website structure may have changed
- Check the console output for errors
- Set `headless: false` to see what's happening

**Issue: Timeout errors**
- Increase timeout in `page.goto()` options
- Check your internet connection
- Reduce `MAX_PAGES` to test with fewer pages

**Issue: Memory errors with large scrapes**
- Set `MAX_PAGES` to a reasonable number (e.g., 50)
- Run multiple smaller scrapes and combine results

## License

MIT
