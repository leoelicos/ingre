const mockRecipe = {
  recipe: {
    uri: 'http://www.edamam.com/ontologies/edamam.owl#recipe_f42a009f8deafadd004f92d89d466d3a',
    label: 'Hurry up Alfredo Sauce (From Vegan Yum Yum)',
    image:
      'https://edamam-product-images.s3.amazonaws.com/web-img/044/04413c4e5431dcaa8fd349574b5daa8a.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=1d8752164542dee5790329460d2d4211057e50236dfc6c3b41a79e6e20fc4b44',
    images: {
      THUMBNAIL: {
        url: 'https://edamam-product-images.s3.amazonaws.com/web-img/044/04413c4e5431dcaa8fd349574b5daa8a-s.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=a869d2aeb0c9ea232d872d4fe8eed913bd45fb249c97ebb7aef839cc7edf64d7',
        width: 100,
        height: 100
      },
      SMALL: {
        url: 'https://edamam-product-images.s3.amazonaws.com/web-img/044/04413c4e5431dcaa8fd349574b5daa8a-m.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=20ee850c6d93bcdf33f02bc910d6fba2e4010311d3140c9505df9451b1291ea2',
        width: 200,
        height: 200
      },
      REGULAR: {
        url: 'https://edamam-product-images.s3.amazonaws.com/web-img/044/04413c4e5431dcaa8fd349574b5daa8a.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=a077c042d9b0247ed5e8bc8710581ad96c9eedfe58459621ab72586d1d94ed6a',
        width: 300,
        height: 300
      },
      LARGE: {
        url: 'https://edamam-product-images.s3.amazonaws.com/web-img/044/04413c4e5431dcaa8fd349574b5daa8a-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=b43dc46e4af1b0b4d9a8a38fd27a52236affbf0ed10d253be641541d4b51785c',
        width: 600,
        height: 600
      }
    },
    shareAs:
      'http://www.edamam.com/recipe/hurry-up-alfredo-sauce-from-vegan-yum-yum-f42a009f8deafadd004f92d89d466d3a/yum',
    yield: 4.0,
    ingredients: [
      {
        text: null,
        quantity: 3.0,
        measure: 'cup',
        food: 'whole wheat pasta',
        weight: 288.0,
        foodCategory: 'grains',
        foodId: 'food_aet2nhrax3uc3ubfefw91b6w094y',
        image:
          'https://www.edamam.com/food-img/fe8/fe84b730ff869fbd68ee9eb598ed455c.jpg'
      },
      {
        text: null,
        quantity: 0.0,
        measure: null,
        food: 'Alfredo Sauce',
        weight: 0.0,
        foodCategory: 'condiments and sauces',
        foodId: 'food_b2ayx5tbjhbyviaj61ut3ajui5yu',
        image: null
      },
      {
        text: null,
        quantity: 1.0,
        measure: 'cup',
        food: 'soymilk',
        weight: 243.0,
        foodCategory: 'non-dairy beverages',
        foodId: 'food_ajck21hbpf1sb6amwkjimb6xl24j',
        image:
          'https://www.edamam.com/food-img/8be/8bef4cf5daa1f41d90aff68c92ca56bc.jpg'
      },
      {
        text: null,
        quantity: 0.3333333333333333,
        measure: 'cup',
        food: 'cashews',
        weight: 46.666666666666664,
        foodCategory: 'plant-based protein',
        foodId: 'food_aa3vawdabgm9zmapkfl78bk049g2',
        image:
          'https://www.edamam.com/food-img/d4b/d4bc3f8024cac35e2039ef5ead328e11.jpg'
      },
      {
        text: null,
        quantity: 0.25,
        measure: 'cup',
        food: 'nutritional yeast',
        weight: 64.0,
        foodCategory: 'Vegan products',
        foodId: 'food_abjagi2b7qlt18aryyugvbnm0tlu',
        image: null
      },
      {
        text: null,
        quantity: 3.0,
        measure: 'tablespoon',
        food: 'soy sauce',
        weight: 48.0,
        foodCategory: 'plant-based protein',
        foodId: 'food_a5g9yevb1iactoaiimbvjbkrxueh',
        image:
          'https://www.edamam.com/food-img/f56/f562e461eb0618f367f538b836c17b82.jpg'
      },
      {
        text: null,
        quantity: 2.0,
        measure: 'tablespoon',
        food: 'margarine',
        weight: 28.0,
        foodCategory: 'Oils',
        foodId: 'food_bpy417na9x14isbywkw04a21r148',
        image:
          'https://www.edamam.com/food-img/33e/33ef6c4bf7db16d574a3f68fa31c4b09.jpg'
      },
      {
        text: null,
        quantity: 1.0,
        measure: 'tablespoon',
        food: 'tahini',
        weight: 15.0,
        foodCategory: 'plant-based protein',
        foodId: 'food_aa88tarawf1yl0bu5w3csaucrnx2',
        image:
          'https://www.edamam.com/food-img/eed/eed4bb62c2763575b73a8f05963073fb.jpg'
      },
      {
        text: null,
        quantity: 1.0,
        measure: 'tablespoon',
        food: 'lemon juice',
        weight: 15.25,
        foodCategory: '100% juice',
        foodId: 'food_bglm6vxahuauteb0n6ynfbg9eryu',
        image:
          'https://www.edamam.com/food-img/e31/e310952d214e78a4cb8b73f30ceeaaf2.jpg'
      },
      {
        text: null,
        quantity: 2.0,
        measure: 'teaspoon',
        food: 'Dijon mustard',
        weight: 10.0,
        foodCategory: 'Condiments and sauces',
        foodId: 'food_a34cdj5b0kyuhfbov30xcb50u4dv',
        image:
          'https://www.edamam.com/food-img/e23/e238f2e4cfa6aa1a30f46dc73e7344eb.jpg'
      },
      {
        text: null,
        quantity: 0.5,
        measure: 'teaspoon',
        food: 'paprika',
        weight: 1.15,
        foodCategory: 'Condiments and sauces',
        foodId: 'food_a9dpcnjb883g67b3lq82ca0421ql',
        image:
          'https://www.edamam.com/food-img/474/474d63763b9d8b9da98c5f43a114648c.jpg'
      },
      {
        text: null,
        quantity: 1.0,
        measure: 'pinch',
        food: 'nutmeg',
        weight: 0.14583333352071937,
        foodCategory: 'Condiments and sauces',
        foodId: 'food_aa8vp2kadkkiiubgpp48fazrqiq2',
        image:
          'https://www.edamam.com/food-img/b9e/b9e54f78ae18cf99a6504b472ba25e7b.jpg'
      },
      {
        text: null,
        quantity: 1.0,
        measure: 'pinch',
        food: 'salt',
        weight: 0.380208334,
        foodCategory: 'Condiments and sauces',
        foodId: 'food_btxz81db72hwbra2pncvebzzzum9',
        image:
          'https://www.edamam.com/food-img/694/6943ea510918c6025795e8dc6e6eaaeb.jpg'
      },
      {
        text: null,
        quantity: 0.0,
        measure: null,
        food: 'pepper',
        weight: 2.305778125002562,
        foodCategory: 'Condiments and sauces',
        foodId: 'food_b6ywzluaaxv02wad7s1r9ag4py89',
        image:
          'https://www.edamam.com/food-img/c6e/c6e5c3bd8d3bc15175d9766971a4d1b2.jpg'
      },
      {
        text: null,
        quantity: 3.0,
        measure: 'clove',
        food: 'garlic',
        weight: 9.0,
        foodCategory: 'vegetables',
        foodId: 'food_avtcmx6bgjv1jvay6s6stan8dnyp',
        image:
          'https://www.edamam.com/food-img/6ee/6ee142951f48aaf94f4312409f8d133d.jpg'
      }
    ]
  },
  _links: {
    self: {
      href: 'https://api.edamam.com/api/recipes/v2/f42a009f8deafadd004f92d89d466d3a?app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0',
      title: 'Self'
    }
  }
}
export const mockResponse = {
  from: 1,
  to: 20,
  count: 557,
  _links: {},
  hits: [mockRecipe, mockRecipe, mockRecipe]
}
