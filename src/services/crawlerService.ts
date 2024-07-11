import axios from 'axios';
import cheerio from 'cheerio';
import jalaali from 'jalaali-js';
import Website from '../models/website';
import { PromisePool } from '@supercharge/promise-pool';

const BASE_URL = 'https://enamad.ir';
const MAX_RETRIES = 5;

// Function to validate Jalali date
const validateJalaliDate = (jalaliDate: string): boolean => {
  const [jy, jm, jd] = jalaliDate.split('/').map(Number);
  return jalaali.isValidJalaaliDate(jy, jm, jd);
};

// Retry logic with exponential backoff
const fetchWithRetry = async (url: string, retries = MAX_RETRIES, delay = 1000): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url);
    } catch (error) {
      if (i < retries - 1) {
        const backoff = delay * Math.pow(2, i);
        console.warn(`Retry ${i + 1} for ${url} after ${backoff}ms`);
        await new Promise(res => setTimeout(res, backoff));
      } else {
        throw error;
      }
    }
  }
};

const fetchPageData = async (url: string): Promise<any[]> => {
  const response = await fetchWithRetry(url);
  const $ = cheerio.load(response.data);

  const websites: any[] = [];

  $('#Div_Content .row').each((index, element) => {
    const domain = $(element).find('a').first().text().trim();
    const name = $(element).find('div').eq(2).text().trim();
    const city = $(element).find('div').eq(4).text().trim();
    const stars = $(element).find('img').length;
    const expirationDateString = $(element).find('div').last().text().trim();

    // Log the raw date string for debugging
    console.log(`Raw data: "${expirationDateString} ${stars} ${city} ${name} ${domain}"`);

    if (!validateJalaliDate(expirationDateString)) {
      console.error(`Skipping entry due to invalid date: ${expirationDateString}`);
      return;
    }

    websites.push({ name, domain, stars, expirationDate: expirationDateString, city });
  });

  return websites;
};

export const crawlEnamad = async (): Promise<void> => {
  try {
    // Fetch the first page to determine the total number of pages
    const firstPageResponse = await axios.get(`${BASE_URL}/DomainListForMIMT`);
    const $ = cheerio.load(firstPageResponse.data);

    // Extract the href of the last page link and determine the total number of pages
    const lastPageLink = $('a[data-ajax-update="#partialContainerYouNeedToReplace"][data-ajax-method="GET"]').last();
    const href = lastPageLink.attr('href');
    const totalPages = parseInt(href?.split('/').pop() || '1', 10);

    console.log(`Total pages to fetch: ${totalPages}`);

    const pageUrls = Array.from({ length: totalPages }, (_, i) => `${BASE_URL}/DomainListForMIMT/Index/${i + 1}`);

    const { results, errors } = await PromisePool
      .withConcurrency(5) // Adjust concurrency level as needed
      .for(pageUrls)
      .process(async (pageUrl: string) => {
        try {
          console.log(`Fetching page: ${pageUrl}`);
          const pageData = await fetchPageData(pageUrl);

          // Introduce a delay to avoid rate limiting
          await new Promise(res => setTimeout(res, 500));

          // Prepare bulk operations for upsert per page
          const bulkOps = pageData.map(website => ({
            updateOne: {
              filter: { domain: website.domain }, // Use a unique field for matching
              update: { $set: website }, // Update with new data
              upsert: true // Insert if not found
            }
          }));

          // Execute bulk operations per page
          if (bulkOps.length > 0) {
            await Website.bulkWrite(bulkOps);
            console.log(`Page data from ${pageUrl} saved to database`);
          }
        } catch (error) {
          console.error(`Error processing page ${pageUrl}:`, error);
          throw error; // Re-throw the error to ensure it is caught and retried if needed
        }
      });

    if (errors.length > 0) {
      console.error('Errors occurred during crawling:', errors);
      console.log('Retrying failed pages...');

      // Retry failed pages
      const failedPageUrls = errors.map((error: any) => error.item);
      await PromisePool
        .withConcurrency(5)
        .for(failedPageUrls)
        .process(async (pageUrl: string) => {
          console.log(`Retrying page: ${pageUrl}`);
          const pageData = await fetchPageData(pageUrl);

          // Introduce a delay to avoid rate limiting
          await new Promise(res => setTimeout(res, 500));

          // Prepare bulk operations for upsert per page
          const bulkOps = pageData.map(website => ({
            updateOne: {
              filter: { domain: website.domain }, // Use a unique field for matching
              update: { $set: website }, // Update with new data
              upsert: true // Insert if not found
            }
          }));

          // Execute bulk operations per page
          if (bulkOps.length > 0) {
            await Website.bulkWrite(bulkOps);
            console.log(`Page data from ${pageUrl} saved to database`);
          }
        });
    }

    console.log('Websites crawled and saved to database');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error crawling Enamad:', error.message);
      // Log the detailed error
      console.error('Detailed error:', error);
    } else {
      console.error('Unexpected error:', error);
    }
  }
};