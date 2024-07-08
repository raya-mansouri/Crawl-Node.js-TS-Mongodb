import Website from '../models/website';

export const websiteResolver = {
  websites: async ({ name, domain, stars, expirationDate }: any) => {
    const filter: any = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (domain) filter.domain = { $regex: domain, $options: 'i' };
    if (stars !== undefined) filter.stars = stars;
    if (expirationDate) filter.expirationDate = new Date(expirationDate);
    return await Website.find(filter);
  },
  numberOfWebsitesPerCity: async () => {
    return await Website.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $project: { city: '$_id', count: 1, _id: 0 } },
    ]);
  },
  websitesGroupedByStars: async () => {
    return await Website.aggregate([
      { $group: { _id: '$stars', count: { $sum: 1 } } },
      { $project: { stars: '$_id', count: 1, _id: 0 } },
    ]);
  },
};