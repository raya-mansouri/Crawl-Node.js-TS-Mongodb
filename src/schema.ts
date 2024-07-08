import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type Website {
    id: ID!
    name: String!
    domain: String!
    stars: Int!
    expirationDate: String!
    city: String!
  }

  type Query {
    websites(name: String, domain: String, stars: Int, expirationDate: String): [Website]
    numberOfWebsitesPerCity: [CityCount]
    websitesGroupedByStars: [StarGroup]
  }

  type CityCount {
    city: String!
    count: Int!
  }

  type StarGroup {
    stars: Int!
    count: Int!
  }
`);

export default schema;