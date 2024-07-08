import { createObjectCsvWriter } from 'csv-writer';
import Website from '../models/website';

export const exportToCSV = async (fields: string[]) => {
  const websites = await Website.find().select(fields.join(' ')).exec();

  const csvWriter = createObjectCsvWriter({
    path: 'websites.csv',
    header: fields.map(field => ({ id: field, title: field })),
  });

  await csvWriter.writeRecords(websites);
  console.log('CSV file created');
};