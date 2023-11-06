import axios from "axios";
import * as cheerio from "cheerio"
import { extractPrice, extractCurrency, extractDescription} from "../utils";

export async function scrapeAmazonProduct(url: string){
    if(!url) return;

 
  // BrightData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

    const options = {
        auth: {
          username: `${username}-session-${session_id}`,
          password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
      }
    try {
        // Fetch the product page
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data)
        // Extract the product title
        const title = $('#productTitle').text().trim();
        
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('.a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            $('.a-price-whole'),
            $('.a-price')
          );
      
          const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price'),
            $(".a-offscreen")
          );

          const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

          const images = 
          $('#imgBlkFront').attr('data-a-dynamic-image') || 
          $('#landingImage').attr('data-a-dynamic-image') ||
          '{}'
    
        const imageUrls = Object.keys(JSON.parse(images));
    
        const currency = extractCurrency($('.a-price-symbol'))
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");
    
        const description = extractDescription($)
    
        // Construct data object with scraped information
        const data = {
          url,
          currency: currency || '$',
          image: imageUrls[0],
          title,
          currentPrice: Number(parseInt(currentPrice)) || Number(parseInt(currentPrice)),
          originalPrice: Number(parseInt(originalPrice)) || Number(parseInt(originalPrice)),
          priceHistory: [],
          discountRate: Number(discountRate),
          category: 'category',
          reviewsCount:100,
          stars: 4.5,
          isOutOfStock: outOfStock,
          description,
          lowestPrice: Number(parseInt(currentPrice)) || Number(parseInt(originalPrice)),
          highestPrice: Number(parseInt(originalPrice)) || Number(parseInt(currentPrice)),
          averagePrice: Number(parseInt(currentPrice)) || Number(parseInt(originalPrice)),
        }

        console.log(data)
        return data;
    } catch (error: any) {
        throw new Error(`Failed to scrape product ${error.message}`)
    }
   
}