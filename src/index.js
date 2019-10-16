import deleteAll from './delete-all';
import getLinks from './get-links';
import getRecipes from './get-recipes';

const main = async () => {
  await deleteAll();
  await getLinks();
  await getRecipes();

  console.log('Success! 🔥')
}

main();