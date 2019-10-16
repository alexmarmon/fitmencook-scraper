import { request } from 'graphql-request'

const hasura = 'http://localhost:8080/v1/graphql';

const deleteLinks = /* GraphQL */ `
  mutation deleteLinks {
    delete_Links(where: {created_at: {_gte: "2018-01-01"}}) {
      affected_rows
    }
  }
`

// const deleteRecipes = /* GraphQL */ `
//   mutation deleteRecipes {
//     delete_Recipes(where: {created_at: {_gte: "2018-01-01"}}) {
//       affected_rows
//     }
//   }
// `

const deleteAll = async () => {
  try {
    await request(hasura, deleteLinks);
    // await request(hasura, deleteRecipes);
  } catch (e) {
    console.error(e);
  }
}

export default deleteAll;