import { Router } from 'express';
import { exportToCSV } from './services/exportService';
import { crawlEnamad } from './services/crawlerService';

const router = Router();

router.get('/crawl', async (req, res) => {
  try {
    await crawlEnamad();
    res.status(200).send('Crawl completed');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error crawling Enamad:', error.message);
      res.status(500).send(`Error: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }  }
});

router.get('/export-csv', async (req, res) => {
  try {
    const fields = req.query.fields?.toString().split(',') || [];
    await exportToCSV(fields);
    res.download('websites.csv');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error crawling Enamad:', error.message);
      res.status(500).send(`Error: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
  }
});

export default router;