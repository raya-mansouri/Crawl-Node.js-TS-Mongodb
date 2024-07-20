Description

You should crawl the websites listed on Enamad and store them in a MongoDB database. Then, we need a GraphQL API to let us search and filter the stored data.

‌

We need to filter websites based on their:

    name
    domain
    stars
    expiration date

‌

We also need some more API endpoints to get aggregated results for:

    Number of submitted websites per city
    Websites grouped by their star ranking

‌

We need an endpoint to download ALL of the data as a CSV file. This endpoint should let us limit the exported CSV’s fields. For example:

/v1/export-csv?fields=name,stars

‌
Tech Stack

    GraphQL
    MongoDB
    NodeJS
    TypeScript

Attachments
LINK
https://enamad.ir/DomainListForMIMTAdded
