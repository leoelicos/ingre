/* import axios from 'axios';

const search = () =>
  axios
    .get(`https://api.edamam.com/api/recipes/v2?type=public&beta=false&q=Delicious&app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0&diet=balanced&health=vegetarian&cuisineType=Italian&mealType=Dinner&dishType=Main%20course&imageSize=LARGE&random=true`)
    .then((res) => res.data.hits)
    .then((hits) =>
      hits.map(({ recipe }) => ({
        label: recipe.label,
        yield: recipe.yield,
        image: recipe.image,
        ingredients: recipe.ingredients.map((ingredient) => ({
          name: ingredient.food,
          category: ingredient.foodCategory,
          quantity: ingredient.quantity,
          measure: ingredient.measure,
          text: ingredient.text
        }))
      }))
    ); */

const search = () => {
  console.log('API was called');
  return [
    {
      label: 'Summer Squash, Tomato, and Basil Pasta',
      yield: 6,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/39c/39c702c748e432a9d2f0a1b51e7922dd.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=b512a228154a734b2f285fd44f3e3fc119c93e59d4103238a4a9c4ee6c704369',
      ingredients: [
        { name: 'olive oil', category: 'Oils', quantity: 2, measure: 'tablespoon', text: '2 tablespoons olive oil' },
        { name: 'garlic', category: 'vegetables', quantity: 4, measure: 'clove', text: '4 cloves garlic, minced' },
        { name: 'summer squash', category: 'vegetables', quantity: 2, measure: '<unit>', text: '2 medium-sized summer squash' },
        { name: 'cherry tomatoes', category: 'vegetables', quantity: 1.5, measure: 'cup', text: '1.5 cups tomatoes. I use a combination of chopped tomatoes and halved cherry tomatoes -- whatever is coming in from the garden' },
        { name: 'gorgonzola cheese', category: 'Cheese', quantity: 2.5, measure: 'tablespoon', text: '2-3 tablespoons crumbled gorgonzola cheese' },
        { name: 'milk', category: 'Milk', quantity: 0.25, measure: 'cup', text: '1/4 cup milk' },
        { name: 'fresh basil', category: 'Condiments and sauces', quantity: 1, measure: 'leaf', text: 'fresh basil leaves, in thin ribbons, for garnish, to taste' },
        { name: 'pasta', category: 'grains', quantity: 1, measure: 'cup', text: '1 cup pasta (penne or cavatappi)' },
        { name: 'salt', category: 'Condiments and sauces', quantity: 0, measure: null, text: 'salt and pepper to taste' },
        { name: 'pepper', category: 'Condiments and sauces', quantity: 0, measure: null, text: 'salt and pepper to taste' }
      ]
    },
    {
      label: 'Pasta alle Erbe',
      yield: 8,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/65f/65f5bac45167e1b3e4f38baed2619019.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=8fe23f1e0aa19dbb52b92f1b44ca43b4fb0c0091ad1b569eae39ca736696de8c',
      ingredients: [
        { name: 'beet greens', category: 'vegetables', quantity: 1.5, measure: 'pound', text: '1½ pounds quick-cooking leafy greens (about 2 bunches), such as chard, spinach or beet greens' },
        { name: 'extra-virgin olive oil', category: 'Oils', quantity: 6, measure: 'tablespoon', text: '6 tablespoons extra-virgin olive oil, divided' },
        { name: 'garlic', category: 'vegetables', quantity: 4, measure: 'clove', text: '4 plump cloves garlic, peeled and thinly sliced' },
        { name: 'kosher salt', category: 'Condiments and sauces', quantity: 1.5, measure: 'teaspoon', text: '1½ teaspoons kosher salt' },
        { name: 'crushed red pepper', category: 'Condiments and sauces', quantity: 0.5, measure: 'teaspoon', text: '½ teaspoon crushed red pepper, or to taste' },
        { name: 'water', category: 'water', quantity: 1, measure: 'cup', text: '1 cup hot water' },
        { name: 'tomato paste', category: 'canned vegetables', quantity: 2, measure: 'tablespoon', text: '2 tablespoons tomato paste' },
        { name: 'fettuccine', category: 'grains', quantity: 1, measure: 'pound', text: '1 pound dry whole-wheat fettuccine' },
        { name: 'Grana Padano', category: 'Cheese', quantity: 1, measure: 'cup', text: '1 cup freshly grated Grana Padano or Parmigiano-Reggiano cheese, plus more for serving' }
      ]
    },
    {
      label: 'Spinach, cheese and potato cannelloni',
      yield: 6,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/ef5/ef51f5c0eb52143b5e882c516db04d13.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=89b00486928d44c163225ead4227b514aa570b1fe52f84ef85e9f701e001a554',
      ingredients: [
        { name: 'potatoes', category: 'vegetables', quantity: 600, measure: 'gram', text: '600 gram potatoes, chopped coarsely' },
        { name: 'spinach', category: 'vegetables', quantity: 500, measure: 'gram', text: '500 gram spinach, trimmed, chopped coarsely' },
        { name: 'feta', category: 'Cheese', quantity: 200, measure: 'gram', text: '200 gram feta, crumbled' },
        { name: 'pecorino cheese', category: 'Cheese', quantity: 80, measure: 'gram', text: '1 cup (80g) finely grated pecorino cheese or parmesan' },
        { name: 'garlic', category: 'vegetables', quantity: 3, measure: 'clove', text: '3 clove garlic, chopped finely' },
        { name: 'fresh sage', category: 'Condiments and sauces', quantity: 2, measure: 'tablespoon', text: '2 tablespoon finely chopped fresh sage' },
        { name: 'olive oil', category: 'Oils', quantity: 60, measure: 'milliliter', text: '1/4 cup (60ml) olive oil' },
        { name: 'tomato passata', category: 'canned vegetables', quantity: 700, measure: 'gram', text: '700 gram tomato passata' },
        { name: 'raw sugar', category: 'sugars', quantity: 2, measure: 'teaspoon', text: '2 teaspoon raw sugar' },
        { name: 'canned diced tomatoes', category: 'canned vegetables', quantity: 400, measure: 'gram', text: '400 gram canned diced tomatoes' },
        { name: 'water', category: 'water', quantity: 60, measure: 'milliliter', text: '1/4 cup (60ml) water' },
        { name: 'cannelloni', category: 'grains', quantity: 250, measure: 'gram', text: '250 gram dried instant cannelloni tubes' }
      ]
    },
    {
      label: 'Spaghetti Aglio E Olio - Easy Delicious Pa',
      yield: 10,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/95c/95c430cd77d9f0924bd1161bcacb22a0.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=07a2fbdc2eaf638e1e6bc76bd9e4c9b3189ca475a1716646b57e0371b8e62858',
      ingredients: [
        { name: 'spaghetti', category: 'grains', quantity: 1, measure: 'pound', text: '* spaghetti, dry 1 pound (whole packet)' },
        { name: 'garlic', category: 'vegetables', quantity: 7.5, measure: 'clove', text: '* garlic 7 to 8 large clove, chopped roughly' },
        { name: 'parsley', category: 'vegetables', quantity: 2, measure: 'tablespoon', text: '* parsley 2 tbsp, fresh and chopped' },
        { name: 'oil', category: 'Oils', quantity: 0, measure: null, text: 'oil and spice' },
        { name: 'olive oil', category: 'Oils', quantity: 0.25, measure: 'cup', text: '* olive oil 1/4 cup' },
        { name: 'red chili flake', category: 'Condiments and sauces', quantity: 0.25, measure: 'teaspoon', text: '* red chili flake 1/4 tsp' },
        { name: 'salt', category: 'Condiments and sauces', quantity: 0, measure: null, text: '* salt to taste' },
        { name: 'parmesan cheese', category: 'Cheese', quantity: 0.5, measure: 'cup', text: '* parmesan cheese 1/2 cup, grated' }
      ]
    },
    {
      label: 'Heirloom Tomato Pasta',
      yield: 3,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/ff1/ff1ab3b31991e61a273f0b5fb855adfe.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=c34f5a119d67d9a39853a851065ca5d432c3d61e14c991ce894ecfbd16361abc',
      ingredients: [
        { name: 'garlic', category: 'vegetables', quantity: 4, measure: 'clove', text: '4 cloves of garlic, thinly sliced' },
        { name: 'olive oil', category: 'Oils', quantity: 0, measure: null, text: 'olive oil' },
        { name: 'red pepper flakes', category: 'vegetables', quantity: 0.25, measure: 'teaspoon', text: '1/4 teaspoon red pepper flakes' },
        { name: 'heirloom tomatoes', category: 'vegetables', quantity: 2, measure: 'pound', text: '2 pounds heirloom tomatoes, roughly chopped' },
        { name: 'fresh basil', category: 'Condiments and sauces', quantity: 1, measure: 'handful', text: '1 handful fresh basil, plus more for garnish' },
        { name: 'spaghetti', category: 'grains', quantity: 8, measure: 'ounce', text: '8 ounces spaghetti' },
        { name: 'sun gold', category: 'vegetables', quantity: 0.5, measure: 'pint', text: '1/2 pint sun gold or cherry tomatoes (optional)' },
        { name: 'parmesan', category: 'Cheese', quantity: 0.25, measure: 'cup', text: '1/4 cup freshly grated parmesan' },
        { name: 'unsalted butter', category: 'Dairy', quantity: 1, measure: 'tablespoon', text: '1 tablespoon unsalted butter' }
      ]
    },
    {
      label: 'Heirloom tomato and pesto pizza',
      yield: 4,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/3ca/3ca7fd2ab9a2aabd17f6fdd47c3fb4e3.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=73bb66d6899094465e8a771572356cec5ae95d69d004a1dd0c418264e95729bf',
      ingredients: [
        { name: 'flour', category: 'grains', quantity: 250, measure: 'gram', text: '250g bread and pizza plain flour' },
        { name: 'yeast', category: 'condiments and sauces', quantity: 1, measure: 'teaspoon', text: '1 teaspoon instant dried yeast' },
        { name: 'salt', category: 'Condiments and sauces', quantity: 1, measure: 'teaspoon', text: '1 teaspoon salt' },
        { name: 'sugar', category: 'sugars', quantity: 0.5, measure: 'teaspoon', text: '1/2 teaspoon sugar' },
        { name: 'water', category: 'water', quantity: 150, measure: 'milliliter', text: '150ml water' },
        { name: 'olive oil', category: 'Oils', quantity: 3, measure: 'teaspoon', text: '3 teaspoons olive oil, plus extra to grease' },
        { name: 'olive oil', category: 'Oils', quantity: 2, measure: 'teaspoon', text: '2 teaspoons olive oil' },
        { name: 'garlic', category: 'vegetables', quantity: 0.5, measure: 'clove', text: '1/2 garlic clove, crushed' },
        { name: 'marjoram', category: 'Condiments and sauces', quantity: 1, measure: 'teaspoon', text: '1 teaspoon chopped fresh marjoram or oregano' },
        { name: 'can diced tomatoes', category: 'canned vegetables', quantity: 200, measure: 'gram', text: '1/2 x 400g can diced tomatoes' },
        { name: 'sugar', category: 'sugars', quantity: 1, measure: 'pinch', text: 'Pinch sugar' },
        { name: 'cayenne pepper', category: 'Condiments and sauces', quantity: 1, measure: 'pinch', text: 'Pinch cayenne pepper' },
        { name: 'tomatoes', category: 'vegetables', quantity: 500, measure: 'gram', text: '500g heirloom or mixed tomatoes, sliced, halved or whole, depending on size.' },
        { name: 'buffalo mozzarella', category: 'Cheese', quantity: 125, measure: 'gram', text: '125g ctn buffalo mozzarella, drained' },
        { name: 'creme fraiche', category: 'Dairy', quantity: 100, measure: 'gram', text: '100g creme fraiche' },
        { name: 'pesto', category: 'condiments and sauces', quantity: 2, measure: 'tablespoon', text: '2 tablespoons good-quality pesto' },
        { name: 'parmesan', category: 'Cheese', quantity: 20, measure: 'gram', text: '20g (1⁄4 cup) parmesan, finely grated' },
        { name: 'rocket', category: 'vegetables', quantity: 1, measure: 'handful', text: 'Handful rocket leaves, optional' }
      ]
    },
    {
      label: 'Egg, tomato and spinach pizzas',
      yield: 4,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/8ce/8cefe1d35dcef62fe9f6ebfcfafd9214.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7ebb88b93c9d517006def0d82c73db70b5a99e5bc41084cdbb76cdee868b95eb',
      ingredients: [
        { name: 'pizza', category: 'pizza', quantity: 2, measure: '<unit>', text: '2 large pizza bases' },
        { name: 'tomato paste', category: 'canned vegetables', quantity: 0.3333333333333333, measure: 'cup', text: '1/3 cup tomato paste' },
        { name: 'cherry tomatoes', category: 'vegetables', quantity: 250, measure: 'gram', text: '250g cherry tomatoes, chopped' },
        { name: 'eggs', category: 'Eggs', quantity: 6, measure: '<unit>', text: '6 eggs' },
        { name: 'spinach', category: 'vegetables', quantity: 50, measure: 'gram', text: '50g baby spinach leaves' },
        { name: 'parmesan cheese', category: 'Cheese', quantity: 100, measure: 'gram', text: '100g parmesan cheese, shaved' }
      ]
    },
    {
      label: 'Riso al Forno (Italian Baked Rice)',
      yield: 6,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/450/450ca78e525cb9cb20c81ecde0d265ae?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=563fa99d5ecfee24a01effb3ee69241aad963e1acc86dfc8f6a34c3bb7cb1582',
      ingredients: [
        { name: 'Cheese, parmesan, grated', category: null, quantity: 0.75, measure: 'cup', text: '¾ cup Cheese, parmesan, grated' },
        { name: 'Bread crumbs, dry, grated, plain', category: null, quantity: 0.5, measure: 'cup', text: '½ cup Bread crumbs, dry, grated, plain' },
        { name: 'Oil, olive, salad or cooking', category: null, quantity: 3, measure: 'tablespoon', text: '3 tablespoons Oil, olive, salad or cooking' },
        { name: 'Onions, raw', category: null, quantity: 1, measure: '<unit>', text: '1 Onions, raw' },
        { name: 'Tomato products, canned, puree, with salt added', category: null, quantity: 23, measure: 'ounce', text: '1 (23 ounce) jar Tomato products, canned, puree, with salt added' },
        { name: 'vegetable broth', category: 'Vegan products', quantity: 1, measure: 'cup', text: '1 cup low sodium, low fat vegetable broth' },
        { name: 'Peas, green, frozen, unprepared', category: null, quantity: 1, measure: 'cup', text: '1 cup Peas, green, frozen, unprepared' },
        { name: 'Basil, fresh', category: null, quantity: 0.25, measure: 'cup', text: '¼ cup Basil, fresh' },
        { name: 'oregano', category: 'Condiments and sauces', quantity: 1, measure: 'tablespoon', text: '1 tablespoon Spices, oregano, ground' },
        { name: 'Spices, thyme, dried', category: null, quantity: 1, measure: 'tablespoon', text: '1 tablespoon Spices, thyme, dried' },
        { name: 'Garlic, raw', category: null, quantity: 1, measure: 'clove', text: '1 clove Garlic, raw' },
        { name: 'Spices, pepper, black', category: null, quantity: 1, measure: 'teaspoon', text: '1 teaspoon Spices, pepper, black' },
        { name: 'red pepper flakes', category: 'vegetables', quantity: 0.5, measure: 'teaspoon', text: '½ teaspoon dried red pepper flakes' },
        { name: 'Rice, white, short-grain, raw', category: null, quantity: 1.25, measure: 'cup', text: '1 ¼ cups Rice, white, short-grain, raw' },
        { name: 'Water', category: 'water', quantity: 1, measure: 'tablespoon', text: '1 tablespoon Water, municipal' },
        { name: 'Cheese, provolone', category: null, quantity: 1, measure: 'cup', text: '1 cup Cheese, provolone' }
      ]
    },
    {
      label: 'Tortellini With Squash, Egg, and Breadcrumbs',
      yield: 4,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/fa0/fa0e6d2f9c27b1e5545c0c73737e1db0.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=4fa01eca527070e80a6885b38e2766399eb5c5cb216f0035fa1bdbc6f3133f8f',
      ingredients: [
        { name: 'cheese tortellini', category: 'canned grains', quantity: 12, measure: 'ounce', text: '12 ounces refrigerated cheese tortellini' },
        { name: 'extra-virgin olive oil', category: 'Oils', quantity: 3, measure: 'tablespoon', text: '3 tablespoons extra-virgin olive oil, divided' },
        { name: 'zucchini', category: 'vegetables', quantity: 3.5, measure: 'cup', text: '3½ cups chopped zucchini' },
        { name: 'garlic', category: 'vegetables', quantity: 1, measure: 'clove', text: '1 garlic clove, minced' },
        { name: 'white wine vinegar', category: 'Condiments and sauces', quantity: 2, measure: 'tablespoon', text: '2 tablespoons white wine vinegar' },
        { name: 'kosher salt', category: 'Condiments and sauces', quantity: 0.75, measure: 'teaspoon', text: '¾ teaspoon kosher salt' },
        { name: 'eggs', category: 'Eggs', quantity: 4, measure: '<unit>', text: '4 large eggs' },
        { name: 'baguette', category: 'bread, rolls and tortillas', quantity: 0.5, measure: '<unit>', text: '½ small baguette, torn into small pieces and toasted' },
        { name: 'black pepper', category: 'Condiments and sauces', quantity: 0.5, measure: 'teaspoon', text: '½ teaspoon black pepper' },
        { name: 'parmesan cheese', category: 'Cheese', quantity: 0.25, measure: 'cup', text: '½ ounce parmesan cheese, finely grated (about ¼ cup)' }
      ]
    },
    {
      label: 'Pasta agli e olio con uovo',
      yield: 2,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/1e3/1e3e13448f94b1e02a76ecfb32b0dfbb.JPG?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=47f5064b4cb00f00270c384df8fe6f574093c1e129ca9bcef43573541482cace',
      ingredients: [
        { name: 'olive oil', category: 'Oils', quantity: 3, measure: 'tablespoon', text: '3 tablespoons olive oil (more or less)' },
        { name: 'garlic', category: 'vegetables', quantity: 3, measure: 'clove', text: '3 large garlic cloves' },
        { name: 'red pepper flakes', category: 'vegetables', quantity: 0.5, measure: 'teaspoon', text: '1/2 teaspoon red pepper flakes' },
        { name: 'parsley', category: 'vegetables', quantity: 0.5, measure: 'cup', text: '1/2 cup flat-leaf parsley (or more to taste)' },
        { name: 'butter', category: 'Dairy', quantity: 0.5, measure: 'tablespoon', text: '1/2 tablespoon butter (optional), plus more for cooking the eggs' },
        { name: 'eggs', category: 'Eggs', quantity: 3, measure: '<unit>', text: '3 eggs' },
        { name: 'spaghetti', category: 'grains', quantity: 0.5, measure: 'pound', text: '1/2 pound spaghetti' },
        { name: 'salt', category: 'Condiments and sauces', quantity: 0, measure: null, text: 'salt and pepper' },
        { name: 'pepper', category: 'Condiments and sauces', quantity: 0, measure: null, text: 'salt and pepper' }
      ]
    },
    {
      label: 'Cheesy Pumpkin Ravioli',
      yield: 6,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/fe9/fe91e54771717b4aed8e279237b46b11.png?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=424cc62d57ff6b418031188bbb8dd6f8888a12c374c2ef4e4775ff02bd48210e',
      ingredients: [
        { name: 'cheese ravioli', category: 'canned grains', quantity: 30, measure: 'ounce', text: '1 (30 ounce) package cheese ravioli' },
        { name: 'mascarpone cheese', category: 'Cheese', quantity: 0.5, measure: 'cup', text: '1/2 cup mascarpone cheese' },
        { name: 'butter', category: 'Dairy', quantity: 2, measure: 'tablespoon', text: '2 tablespoons butter' },
        { name: 'black pepper', category: 'Condiments and sauces', quantity: 1, measure: 'pinch', text: '1 pinch ground black pepper' },
        { name: 'skim milk', category: 'milk', quantity: 1.5, measure: 'cup', text: '1 1/2 cups skim milk' },
        { name: 'pumpkin puree', category: 'canned vegetables', quantity: 1, measure: 'cup', text: '1 cup pumpkin puree' },
        { name: 'Pecorino Romano cheese', category: 'Cheese', quantity: 0.5, measure: 'cup', text: '1/2 cup grated Pecorino Romano cheese' },
        { name: 'brown sugar', category: 'sugars', quantity: 1, measure: 'tablespoon', text: '1 tablespoon brown sugar' },
        { name: 'ground cinnamon', category: 'Condiments and sauces', quantity: 2, measure: 'teaspoon', text: '2 teaspoons ground cinnamon' },
        { name: 'salt', category: 'Condiments and sauces', quantity: 2, measure: 'teaspoon', text: '2 teaspoons salt' },
        { name: 'nutmeg', category: 'Condiments and sauces', quantity: 1, measure: 'teaspoon', text: '1 teaspoon nutmeg' },
        { name: 'salt', category: 'Condiments and sauces', quantity: 0, measure: null, text: 'salt and ground black pepper to taste' },
        { name: 'black pepper', category: 'Condiments and sauces', quantity: 0, measure: null, text: 'salt and ground black pepper to taste' },
        { name: 'pine nuts', category: 'plant-based protein', quantity: 0.3333333333333333, measure: 'cup', text: '1/3 cup pine nuts' }
      ]
    },
    {
      label: "Julia Turshen's Hot Bread Pizza",
      yield: 4,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/a33/a332121eaa60a84c93174a5ee54e06b2.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=0ef083d6b456305fda500f361272e990f2aed86f54ed3159a4ca2f0ef9cfaf7b',
      ingredients: [
        { name: 'pizza dough', category: 'bread, rolls and tortillas', quantity: 0.5, measure: 'pound', text: '1/2 pound pizza dough' },
        { name: 'tomato sauce', category: 'canned vegetables', quantity: 1, measure: 'cup', text: '1 cup tomato sauce, whichever is your favorite' },
        { name: 'mozzarella cheese', category: 'Cheese', quantity: 0.25, measure: 'pound', text: '1/4 pound fresh mozzarella cheese, torn' },
        { name: 'arugula', category: 'vegetables', quantity: 4, measure: 'handful', text: '4 large handfuls of arugula' },
        { name: 'olive oil', category: 'Oils', quantity: 2, measure: 'tablespoon', text: '2 tablespoons olive oil' },
        { name: 'basil', category: 'Condiments and sauces', quantity: 1, measure: 'leaf', text: 'leaves from 1 sprig basil, torn' },
        { name: 'lemon', category: 'fruit', quantity: 0.5, measure: '<unit>', text: '1/2 lemon, juiced' },
        { name: 'tomato', category: 'vegetables', quantity: 1, measure: '<unit>', text: '1 ripe tomato, sliced into wedges' }
      ]
    },
    {
      label: 'Baked beans, pesto and smoked cheddar jaffle',
      yield: 2,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/6d3/6d37145df20d000fe050db126f537595.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=6a26ffe600b967ca473effd5ce7aa276c54c22708d9fb3c88b2e6e00879911c4',
      ingredients: [
        { name: 'white bread', category: 'bread, rolls and tortillas', quantity: 180, measure: 'gram', text: '4 slice (180g) white bread' },
        { name: 'butter', category: 'Dairy', quantity: 20, measure: 'gram', text: '20 gram softened butter' },
        { name: 'basil pesto', category: 'condiments and sauces', quantity: 2, measure: 'tablespoon', text: '2 tablespoon basil pesto' },
        { name: 'baked beans', category: 'plant-based protein', quantity: 260, measure: 'gram', text: '260 gram baked beans' },
        { name: 'cheddar', category: 'Cheese', quantity: 2, measure: 'tablespoon', text: '2 tablespoon coarsely grated smoked cheddar' }
      ]
    },
    {
      label: 'Rigatoni with eggplant, capsicum and bocconcini recipe',
      yield: 4,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/4a5/4a5727e03300e1ffd4f85c615aa61f48.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=4adcae3639e0318371472e84725c9c6697e009becc0daec854fa2f56a8f1c6d8',
      ingredients: [
        { name: 'olive oil', category: 'Oils', quantity: 4, measure: 'tablespoon', text: '4 tbsp olive oil' },
        { name: 'garlic', category: 'vegetables', quantity: 3, measure: 'clove', text: '3 cloves garlic, peeled and roughly chopped' },
        { name: 'eggplant', category: 'vegetables', quantity: 1, measure: '<unit>', text: '1 medium eggplant, cut into 1.5cm cubes' },
        { name: 'capsicum', category: 'vegetables', quantity: 1, measure: '<unit>', text: '1 red capsicum, seeded and cut into 1cm cubes' },
        { name: 'rigatoni', category: 'grains', quantity: 500, measure: 'gram', text: '500g dried rigatoni' },
        { name: 'cheese', category: 'Cheese', quantity: 250, measure: 'gram', text: '250g bocconcini cheese, quartered' },
        { name: 'basil', category: 'Condiments and sauces', quantity: 0.25, measure: 'cup', text: '¼ cup freshly torn basil leaves, to serve' },
        { name: 'black pepper', category: 'Condiments and sauces', quantity: 0, measure: null, text: 'freshly ground black pepper, to serve' }
      ]
    },
    {
      label: "Spring greens and goat's cheese pasta",
      yield: 4,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/c71/c7164e903d0c522083c7c240a8571973.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=b49fd5225d439965b28f2ca2cd773dcfa70cd030326497cc56f0f3d0a84fa0a6',
      ingredients: [
        { name: 'broad beans', category: 'vegetables', quantity: 400, measure: 'gram', text: '400 gram frozen broad beans' },
        { name: 'pasta', category: 'grains', quantity: 500, measure: 'gram', text: '500 gram casarecce pasta' },
        { name: 'olive oil', category: 'Oils', quantity: 80, measure: 'milliliter', text: '1/3 cup (80ml) olive oil' },
        { name: 'zucchinis', category: 'vegetables', quantity: 2, measure: '<unit>', text: '2 small (180g) zucchinis, sliced thinly' },
        { name: 'garlic', category: 'vegetables', quantity: 1, measure: 'clove', text: '1 clove garlic, crushed' },
        { name: 'peas', category: 'vegetables', quantity: 150, measure: 'gram', text: '150 gram shelled fresh peas' },
        { name: 'goats cheese', category: 'Cheese', quantity: 150, measure: 'gram', text: '150 gram goats cheese, crumbled' },
        { name: 'mint leaves', category: 'Condiments and sauces', quantity: 0.5, measure: 'cup', text: '1/2 cup fresh mint leaves, loosely packed' },
        { name: 'butter', category: 'Dairy', quantity: 40, measure: 'gram', text: '40 gram butter' },
        { name: 'olive oil', category: 'Oils', quantity: 1, measure: 'tablespoon', text: '1 tablespoon olive oil' },
        { name: 'garlic', category: 'vegetables', quantity: 1, measure: 'clove', text: '1 clove garlic, crushed' },
        { name: 'lemon rind', category: 'fruit', quantity: 1, measure: 'teaspoon', text: '1 teaspoon lemon rind, finely grated' },
        { name: 'fresh breadcrumbs', category: 'bread, rolls and tortillas', quantity: 70, measure: 'gram', text: '1 cup (70g) coarse fresh breadcrumbs' }
      ]
    },
    {
      label: 'Pesto and chargrilled vegetable pasta',
      yield: 4,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/b3c/b3cd4a575c80fe9037e6cb797236a9ad.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=b2c94296edad65ee962fe6fd9f6ded3df96b8028580c5dafa5bfdaf173cf9643',
      ingredients: [
        { name: 'spaghetti', category: 'grains', quantity: 400, measure: 'gram', text: '400g spaghetti' },
        { name: 'kalamata olives', category: 'canned fruit', quantity: 0.5, measure: 'cup', text: '1/2 cup kalamata olives' },
        { name: 'tomatoes', category: 'vegetables', quantity: 0.5, measure: 'cup', text: '1/2 cup semi-dried tomatoes, cut into strips' },
        { name: 'eggplant', category: 'vegetables', quantity: 100, measure: 'gram', text: '100g chargrilled eggplant, cut into strips' },
        { name: 'capsicum', category: 'vegetables', quantity: 100, measure: 'gram', text: '100g chargrilled capsicum, cut into strips' },
        { name: 'pine nuts', category: 'plant-based protein', quantity: 0.3333333333333333, measure: 'cup', text: '1/3 cup pine nuts, toasted' },
        { name: 'basil', category: 'Condiments and sauces', quantity: 1, measure: 'bunch', text: '1 bunch basil, leaves picked' },
        { name: 'parsley', category: 'vegetables', quantity: 1, measure: 'bunch', text: '1 bunch flat-leaf parsley, leaves picked' },
        { name: 'garlic', category: 'vegetables', quantity: 2, measure: 'clove', text: '2 garlic cloves' },
        { name: 'olive oil', category: 'Oils', quantity: 2, measure: 'tablespoon', text: '2 tablespoons olive oil' },
        { name: 'parmesan cheese', category: 'Cheese', quantity: 0.3333333333333333, measure: 'cup', text: '1/3 cup finely grated parmesan cheese' },
        { name: 'lemon', category: 'fruit', quantity: 0.5, measure: '<unit>', text: '1/2 lemon, juiced' }
      ]
    },
    {
      label: 'Sheet-Pan Caprese Pizza',
      yield: 6,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/ef8/ef8960cf850e0c4b21292f4c97befc6a?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=150a23e32606208f0b12b767d56a3dc105e8664d0e448c7ef0b7256f2d704baa',
      ingredients: [
        { name: 'whole-wheat pizza dough', category: 'bread, rolls and tortillas', quantity: 1, measure: 'pound', text: '1 pound fresh prepared whole-wheat pizza dough' },
        { name: 'olive oil', category: 'Oils', quantity: 1, measure: 'tablespoon', text: '1 tablespoon olive oil' },
        { name: 'kosher salt', category: 'Condiments and sauces', quantity: 0.75, measure: 'teaspoon', text: '¾ teaspoon kosher salt, divided' },
        { name: 'black pepper', category: 'Condiments and sauces', quantity: 0.5, measure: 'teaspoon', text: '½ teaspoon black pepper, divided' },
        { name: 'mozzarella cheese', category: 'Cheese', quantity: 8, measure: 'ounce', text: '8 ounces fresh mozzarella cheese, thinly sliced' },
        { name: 'heirloom tomatoes', category: 'vegetables', quantity: 2, measure: 'cup', text: '2 cups baby heirloom tomatoes, halved or quartered' },
        { name: 'fresh basil', category: 'Condiments and sauces', quantity: 0.5, measure: 'cup', text: '½ cup loosely packed fresh basil leaves' },
        { name: 'balsamic', category: 'Condiments and sauces', quantity: 2, measure: 'tablespoon', text: '2 tablespoons balsamic glaze' }
      ]
    },
    {
      label: 'Creamy Marsala Mushroom Pasta',
      yield: 6,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/a33/a332121eaa60a84c93174a5ee54e06b2.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=0ef083d6b456305fda500f361272e990f2aed86f54ed3159a4ca2f0ef9cfaf7b',
      ingredients: [
        { name: 'mushrooms', category: 'vegetables', quantity: 2, measure: 'quart', text: '2 quarts buttom mushrooms' },
        { name: 'portabella mushrooms', category: 'vegetables', quantity: 4, measure: '<unit>', text: '4 portabella mushrooms' },
        { name: 'red onion', category: 'vegetables', quantity: 1, measure: '<unit>', text: '1 red onion (small dice)' },
        { name: 'garlic', category: 'vegetables', quantity: 10, measure: 'clove', text: '10 garlic cloves (minced)' },
        { name: 'olive oil', category: 'Oils', quantity: 4, measure: 'tablespoon', text: '4 tablespoons olive oil' },
        { name: 'red pepper flakes', category: 'vegetables', quantity: 0.25, measure: 'teaspoon', text: '1/4 teaspoon red pepper flakes' },
        { name: 'wine', category: 'wines', quantity: 0.5, measure: 'cup', text: '1/2 cup marsala wine' },
        { name: 'half & half', category: 'Dairy', quantity: 2, measure: 'cup', text: '2 cups half & half' },
        { name: 'milk', category: 'Milk', quantity: 3, measure: 'cup', text: '3 cups milk' },
        { name: 'lemon', category: 'fruit', quantity: 1, measure: '<unit>', text: '1 lemon' },
        { name: 'parmesan cheese', category: 'Cheese', quantity: 6, measure: 'ounce', text: '6 ounces parmesan cheese' },
        { name: 'cream cheese', category: 'Cheese', quantity: 8, measure: 'ounce', text: '8 ounces cream cheese' },
        { name: 'basil', category: 'Condiments and sauces', quantity: 1, measure: 'tablespoon', text: '1 tablespoon basil (chopped)' },
        { name: 'pasta', category: 'grains', quantity: 1.5, measure: 'pound', text: '1 1/2 pounds pasta' },
        { name: 'salt', category: 'Condiments and sauces', quantity: 0, measure: null, text: 'salt & pepper' }
      ]
    },
    {
      label: 'Pasta Inverno (Winter Vegetable Pasta)',
      yield: 4,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/fe9/fe91e54771717b4aed8e279237b46b11.png?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=424cc62d57ff6b418031188bbb8dd6f8888a12c374c2ef4e4775ff02bd48210e',
      ingredients: [
        { name: 'bow-tie pasta', category: 'grains', quantity: 1, measure: 'pound', text: '1 pound whole grain bow-tie pasta' },
        { name: 'extra-virgin olive oil', category: 'Oils', quantity: 0.5, measure: 'cup', text: '1/2 cup extra-virgin olive oil' },
        { name: 'winter squash', category: 'vegetables', quantity: 2, measure: 'cup', text: '2 cups peeled, seeded, and cubed winter squash' },
        { name: 'sweet onion', category: 'vegetables', quantity: 1, measure: '<unit>', text: '1 sweet onion, diced' },
        { name: 'red bell pepper', category: 'vegetables', quantity: 1, measure: '<unit>', text: '1 red bell pepper, diced' },
        { name: 'can diced tomatoes', category: 'canned vegetables', quantity: 15, measure: 'ounce', text: '1 (15 ounce) can diced tomatoes' },
        { name: 'green beans', category: 'vegetables', quantity: 1, measure: 'cup', text: '1 cup fresh green beans, cut into 1-inch pieces' },
        { name: 'kalamata olives', category: 'canned fruit', quantity: 0.5, measure: 'cup', text: '1/2 cup pitted kalamata olives' },
        { name: 'garlic', category: 'vegetables', quantity: 2, measure: 'tablespoon', text: '2 tablespoons minced garlic' },
        { name: 'spinach', category: 'vegetables', quantity: 3, measure: 'cup', text: '3 cups torn fresh spinach' },
        { name: 'red wine vinegar', category: 'Condiments and sauces', quantity: 0.5, measure: 'cup', text: '1/2 cup red wine vinegar' },
        { name: 'white sugar', category: 'sugars', quantity: 3, measure: 'tablespoon', text: '3 tablespoons white sugar' },
        { name: 'fresh basil', category: 'Condiments and sauces', quantity: 1, measure: 'tablespoon', text: '1 tablespoon minced fresh basil' },
        { name: 'sea salt', category: 'Condiments and sauces', quantity: 0.5, measure: 'teaspoon', text: '1/2 teaspoon sea salt, or to taste' },
        { name: 'black pepper', category: 'Condiments and sauces', quantity: 0.5, measure: 'teaspoon', text: '1/2 teaspoon cracked black pepper, or to taste' },
        { name: 'Parmesan cheese', category: 'Cheese', quantity: 0.5, measure: 'cup', text: '1/2 cup grated Parmesan cheese' }
      ]
    },
    {
      label: 'Grilled Tomato and Corn Pasta',
      yield: 6,
      image:
        'https://edamam-product-images.s3.amazonaws.com/web-img/570/570b9a543a88b944023e1f55523de06c.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEDkaCXVzLWVhc3QtMSJGMEQCIFXhSS0b0xEVPwuuxTKot%2Bu%2B9U65yxU6G4%2Bviq6%2By7zdAiA3OcEWDmrEQW29XVfJnP%2BkklvMKOggqMA4D7ONv314wCrbBAiS%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDE4NzAxNzE1MDk4NiIMA5BZJeF6N5VYRN35Kq8EHPrzFzBcl1k0jRrvm1doiq5yJYQwj85z3M7dL0FKrxjGBUyBlktFXhom8ymiqIcLyhqORfFOHS0rBzvkxdhlw45XoRmWxsh5zV%2BC7uAT%2BXenAnSGk8xCOqw1EwC7%2FCWfLOk1EHygk5oNkM7QaXAFgE6rdXk9Sgz%2FB2cgqp2tq7si%2BQAFXTjWeBQQq7vCP2PGc3LRuLqSYtqGmZf9k3jMh6DLJma3ryHFgA2Xt4Rz3PHYWED5HVWWuqvJaSXcYfSfs42nCXC7ENDCXZnKLHX0SAdJYun7N1Hma9%2B9IPM6STm91snnw%2B6B61M7Ntm5sH9g%2FQ%2FZyau0utqA3%2B1w4rmf52Trnb9LGvQXxQyDbi83jBiRcXOedc2iMDkNBfatB5j%2FgacEXyHmBaWm4qAjzAa%2FepRZDqyIfL7csVMh0Qj0xJx0RRMwvI5NbRB4n9dGfcIWcKU0Sq1NOZBLjMaasr981eZZlWlDeem9pKtw5QX%2Bjn3UzdVSjYcLLqUiXC99vzRlKJAd3zHh9aC2FnKnmxnZFgorEOtVuENJQ8x7UFGZDA3%2FOjzbyZdq2BlgR06GiPBwmzEQ05op4as4h0Cfb%2BJZDI8WwqXM25UZUYZr4LHBSeMuCQwvSFwHMaVwYyaYWkxYSa0pS5DMhE6a8EqYKXMmeK8mhYwv9EGho7sZDckV4xMNQmUZfbq5RGCu6P9Od9DUE3ST5eBwKYErv1q28FhG0aWFLMGDxy%2FkuMSFQcfRvzC8x6qXBjqqAdJSGwiU9zaUsP5BIdlfI8adB6lUP6n6d%2FUXBvDmlwTLQ6IscXgGWdxUiIKBYhJGMgClD8h1yAdgaPqhVkV10lgd7Xas5QrH2nLTpqGlxWGRzwBhDXKmXetGRTrNfHHeQumajqRTHt7kAkB6nfeuIgapwIVRrJmISIp2ysPctKxcUxhoWz%2Fkv3U4UgpU%2Bw9%2BtEiSFERGDuxGigSWdzhudebTDv3q3uVKgjcG&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220803T173909Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFJHZWNWWO%2F20220803%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d7675fb08471c97aae1b12b56ded6797bb3cb9d9409473e076acd215db9d28d3',
      ingredients: [
        { name: 'Salt', category: 'Condiments and sauces', quantity: 0, measure: null, text: 'Salt and pepper' },
        { name: 'pepper', category: 'Condiments and sauces', quantity: 0, measure: null, text: 'Salt and pepper' },
        { name: 'pasta', category: 'grains', quantity: 0.75, measure: 'pound', text: '3/4 pound gemelli pasta' },
        { name: 'olive oil', category: 'Oils', quantity: 0.25, measure: 'cup', text: '1/4 cup olive oil, plus more for grilling' },
        { name: 'beefsteak tomatoes', category: 'vegetables', quantity: 1.5, measure: 'pound', text: '1 1/2 pounds beefsteak tomatoes, halved' },
        { name: 'corn', category: 'vegetables', quantity: 3, measure: 'ear', text: '3 ears corn' },
        { name: 'ricotta', category: 'Cheese', quantity: 1, measure: 'cup', text: '1 cup ricotta' },
        { name: 'fresh basil', category: 'Condiments and sauces', quantity: 0.5, measure: 'cup', text: '1/2 cup torn fresh basil' }
      ]
    }
  ];
};

// Use mock results

// Export an object with a "search" method that searches the Giphy API for the passed query
export default search;
