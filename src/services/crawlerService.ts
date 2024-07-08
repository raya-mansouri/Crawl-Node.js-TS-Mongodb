import axios from 'axios';
import cheerio from 'cheerio';
import jalaali from 'jalaali-js';
import Website from '../models/website';

// Function to convert Jalali date to Gregorian date
const convertJalaliToGregorian = (jalaliDate: string): Date | null => {
  const [jy, jm, jd] = jalaliDate.split('/').map(Number);
  if (!jy || !jm || !jd) {
    return null;
  }
  
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
};

export const crawlEnamad = async () => {
  try {
    const response = await axios.get('https://enamad.ir/DomainListForMIMT/');
    const $ = cheerio.load(response.data);

    const websites: any[] = [];

    $('#Div_Content .row').each((index, element) => {
      const domain = $(element).find('a').first().text().trim();
      const name = $(element).find('div').eq(2).text().trim();
      const city = $(element).find('div').eq(4).text().trim();
      const stars = $(element).find('img').length;
      const expirationDateString = $(element).find('div').last().text().trim();

      // Log the raw date string for debugging
      console.log(`Raw expiration date string: "${expirationDateString}"`);

      const expirationDate = convertJalaliToGregorian(expirationDateString);

      if (!expirationDate || isNaN(expirationDate.getTime())) {
        console.error(`Skipping entry due to invalid date: ${expirationDateString}`);
        return;
      }

      websites.push({ name, domain, stars, expirationDate, city });
    });

    await Website.insertMany(websites);
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