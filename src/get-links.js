import axios from 'axios';
import cheerio from 'cheerio';
import _ from 'lodash';
import { request } from 'graphql-request'

const url = 'https://fitmencook.com/recipes-sitemap.xml';
const hasura = 'http://localhost:8080/v1/graphql';

const query = /* GraphQL */ `
  mutation InsertLinks($url: String!) {
    insert_Links(objects: { url: $url }) {
      returning {
        id
      }
    }
  }
`

const getLinks = async () => {
  const response = await axios(url);
  const html = response.data;
  const $ = cheerio.load(html, { xmlMode: true, xml: { normalizeWhitespace: true } });
  const links = $('loc');
  for (const [key, link] of _.toPairs(links)) {
    if (!_.isEmpty(link.children)) {
      const url = link.children[0].data;
      if (!url.includes('https://fitmencook.com/es')) {
        try {
          await request(hasura, query, { url });
          console.log('Inserted - ', _.replace(url, 'https://fitmencook.com/', ''))
        } catch (e) {
          console.error(e);
        }
      }
    } 
  }
}

export default getLinks;