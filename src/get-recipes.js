import axios from 'axios';
import cheerio from 'cheerio';
import _ from 'lodash';
import { request } from 'graphql-request'

const hasura = 'http://localhost:8080/v1/graphql';

const linksQuery = /* GraphQL */ `
  query linksQuery {
    Links {
      url
      id
    }
  }
`

const recipeMutation = /* GraphQL */ `
  mutation recipeMutation($calories: Int, $protein: Int, $fat: Int, $carbs: Int, $fiber: Int, $name: String, $link_id: uuid, $link: String) {
    insert_Recipes(objects: { calories: $calories, protein: $protein, fat: $fat, carbs: $carbs, fiber: $fiber, name: $name, link_id: $link_id, link: $link }) {
      affected_rows
    }
  }
`

const getRecipes = async () => {
  const { Links } = await request(hasura, linksQuery);
  for (const { url, id } of Links) {
    try {
      const pageResponse = await axios(url);
      const html = pageResponse.data;
      const $ = cheerio.load(html);
      const fields = {};
      // get macro info
      $('.macros-bottom-info').each((i, elem) => {
        const macro = {};
        $(elem).children('span').each((j, el) => {
          const val = _.trim($(el).text());
          macro[j === 0 ? 'name' : 'value'] = val;
        })
        if (macro.value !== '-') {
          fields[_.lowerCase(macro.name)] = parseInt(_.replace(macro.value, 'g', ''), 10);
        }
      });
      // get name
      fields.name = _.trim($('.recipe-instructions-headline h3').text());
      fields.link_id = id;
      fields.link = url;
      try {
        await request(hasura, recipeMutation, _.pick(fields, ['calories', 'protein', 'fat', 'carbs', 'fiber', 'name', 'link_id', 'link']));
        console.log('Inserted - ', _.trim(fields.name));
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.log('couldn\'t get url')
    }
  }
  // const response = await axios(url);
  // const html = response.data;
  // const $ = cheerio.load(html, { xmlMode: true, xml: { normalizeWhitespace: true } });
  // const links = $('loc');
  // for (const [key, link] of _.toPairs(links)) {
  //   if (!_.isEmpty(link.children)) {
  //     const url = link.children[0].data;
  //     console.log(url);
  //     if (!url.includes('https://fitmencook.com/es')) {
  //       try {
  //         await request(hasura, query, { url });
  //       } catch (e) {
  //         console.error(e);
  //       }
  //     }
  //   } 
  // }
}

export default getRecipes;