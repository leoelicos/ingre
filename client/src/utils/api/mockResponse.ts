export const mockResponse = {
  from: 1,
  to: 20,
  count: 557,
  _links: {},
  hits: [
    {
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
    },
    {
      recipe: {
        uri: 'http://www.edamam.com/ontologies/edamam.owl#recipe_04aba8e3287d6ad5a7b6e136e2efe8a8',
        label: 'Make-Ahead Veggie Breakfast Burritos',
        image:
          'https://edamam-product-images.s3.amazonaws.com/web-img/8d3/8d3fa321fe255b6bb9950422fed3acf1.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=40ab88de57f5540813b44490ebfa96de63333cb64b11496b96d99209ac51aeb0',
        images: {
          THUMBNAIL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/8d3/8d3fa321fe255b6bb9950422fed3acf1-s.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=981546f34c48702c115d0d8f13d8a3954a619c472f374fccae6459ac1b114479',
            width: 100,
            height: 100
          },
          SMALL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/8d3/8d3fa321fe255b6bb9950422fed3acf1-m.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=80287c623c0f4366b8dd80db4f2dc5ecd9c2eb07bbbdbcb52e23c9f9fdf9a2dd',
            width: 200,
            height: 200
          },
          REGULAR: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/8d3/8d3fa321fe255b6bb9950422fed3acf1.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=40ab88de57f5540813b44490ebfa96de63333cb64b11496b96d99209ac51aeb0',
            width: 300,
            height: 300
          },
          LARGE: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/8d3/8d3fa321fe255b6bb9950422fed3acf1-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=dbd3c1a4fd9a04dea3bc4b4cbcdd445a54923014fe113b195d10fc7ae170d61e',
            width: 600,
            height: 600
          }
        },
        shareAs:
          'http://www.edamam.com/recipe/make-ahead-veggie-breakfast-burritos-04aba8e3287d6ad5a7b6e136e2efe8a8/yum',
        yield: 12.0,
        ingredients: [
          {
            text: null,
            quantity: 2.0,
            measure: 'tablespoon',
            food: 'olive oil',
            weight: 27.0,
            foodCategory: 'Oils',
            foodId: 'food_b1d1icuad3iktrbqby0hiagafaz7',
            image:
              'https://www.edamam.com/food-img/4d6/4d651eaa8a353647746290c7a9b29d84.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: '<unit>',
            food: 'onion',
            weight: 70.0,
            foodCategory: 'vegetables',
            foodId: 'food_bmrvi4ob4binw9a5m7l07amlfcoy',
            image:
              'https://www.edamam.com/food-img/205/205e6bf2399b85d34741892ef91cc603.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: '<unit>',
            food: 'red bell pepper',
            weight: 119.0,
            foodCategory: 'vegetables',
            foodId: 'food_a8g63g7ak6bnmvbu7agxibp4a0dy',
            image:
              'https://www.edamam.com/food-img/4dc/4dc48b1a506d334b4ab6671b9d56a18f.jpeg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: '<unit>',
            food: 'green bell pepper',
            weight: 116.28888888888889,
            foodCategory: 'vegetables',
            foodId: 'food_bz8rcwobbzm7zhb3wh2n7aznivou',
            image:
              'https://www.edamam.com/food-img/629/629dc9fddc1f8aec27fa337dd6ce2b7c.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: '<unit>',
            food: 'jalapeno peppers',
            weight: 28.0,
            foodCategory: 'vegetables',
            foodId: 'food_b7txsnbadj6plsbq27zvwah80r6y',
            image:
              'https://www.edamam.com/food-img/0df/0df9aa459870a6d477b0925c1fdb6d4c.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'clove',
            food: 'garlic',
            weight: 3.0,
            foodCategory: 'vegetables',
            foodId: 'food_avtcmx6bgjv1jvay6s6stan8dnyp',
            image:
              'https://www.edamam.com/food-img/6ee/6ee142951f48aaf94f4312409f8d133d.jpg'
          },
          {
            text: null,
            quantity: 15.0,
            measure: 'ounce',
            food: 'black beans',
            weight: 425.242846875,
            foodCategory: 'plant-based protein',
            foodId: 'food_bazzo85azdbkmsb56nu4ra5rphoe',
            image:
              'https://www.edamam.com/food-img/850/8505bc3d47bbc820b69d532202f61ce1.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'tablespoon',
            food: 'cilantro',
            weight: 2.0,
            foodCategory: 'vegetables',
            foodId: 'food_alhzhuwb4lc7jnb5s6f02by60bzp',
            image:
              'https://www.edamam.com/food-img/d57/d57e375b6ff99a90c7ee2b1990a1af36.jpg'
          },
          {
            text: null,
            quantity: 6.0,
            measure: '<unit>',
            food: 'eggs',
            weight: 300.0,
            foodCategory: 'Eggs',
            foodId: 'food_bhpradua77pk16aipcvzeayg732r',
            image:
              'https://www.edamam.com/food-img/a7e/a7ec7c337cb47c6550b3b118e357f077.jpg'
          },
          {
            text: null,
            quantity: 0.25,
            measure: 'cup',
            food: 'milk',
            weight: 61.0,
            foodCategory: 'Milk',
            foodId: 'food_b49rs1kaw0jktabzkg2vvanvvsis',
            image:
              'https://www.edamam.com/food-img/7c9/7c9962acf83654a8d98ea6a2ade93735.jpg'
          },
          {
            text: null,
            quantity: 12.0,
            measure: 'ounce',
            food: 'cheese',
            weight: 340.1942775,
            foodCategory: 'Cheese',
            foodId: 'food_bhppgmha1u27voagb8eptbp9g376',
            image:
              'https://www.edamam.com/food-img/bcd/bcd94dde1fcde1475b5bf0540f821c5d.jpg'
          },
          {
            text: null,
            quantity: 0.0,
            measure: null,
            food: 'salt',
            weight: 12.478356079583333,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_btxz81db72hwbra2pncvebzzzum9',
            image:
              'https://www.edamam.com/food-img/694/6943ea510918c6025795e8dc6e6eaaeb.jpg'
          },
          {
            text: null,
            quantity: 0.0,
            measure: null,
            food: 'black pepper',
            weight: 6.239178039791667,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_b6ywzluaaxv02wad7s1r9ag4py89',
            image:
              'https://www.edamam.com/food-img/c6e/c6e5c3bd8d3bc15175d9766971a4d1b2.jpg'
          },
          {
            text: null,
            quantity: 12.0,
            measure: '<unit>',
            food: 'flour tortillas',
            weight: 588.0,
            foodCategory: 'bread, rolls and tortillas',
            foodId: 'food_a9ql6pdb639bs5b2nlvbob3w0mlj',
            image:
              'https://www.edamam.com/food-img/357/357e415685787e6d6844e8d08c1b1586.jpg'
          }
        ]
      },
      _links: {
        self: {
          href: 'https://api.edamam.com/api/recipes/v2/04aba8e3287d6ad5a7b6e136e2efe8a8?app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0',
          title: 'Self'
        }
      }
    },
    {
      recipe: {
        uri: 'http://www.edamam.com/ontologies/edamam.owl#recipe_45b78fb8a4b441bbb2de6c632b6c4a65',
        label: 'Walnut “Chorizo” Baked Taquitos',
        image:
          'https://edamam-product-images.s3.amazonaws.com/web-img/457/457bd384cef4349ead70c38c010f352c.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=bb00183baebb4a2ba402d2c5bcca5bd74368ae62e610470b574fcc5b3d05c72b',
        images: {
          THUMBNAIL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/457/457bd384cef4349ead70c38c010f352c-s.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=52d4e476334e71cc20787cf3275d1c5d706ca6417956544665bcff3526ba1f87',
            width: 100,
            height: 100
          },
          SMALL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/457/457bd384cef4349ead70c38c010f352c-m.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7fe424557001efa15b3dbb2f8c8ca62f10f3940cd90779d71a5726d30c7d1db9',
            width: 200,
            height: 200
          },
          REGULAR: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/457/457bd384cef4349ead70c38c010f352c.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=bb00183baebb4a2ba402d2c5bcca5bd74368ae62e610470b574fcc5b3d05c72b',
            width: 300,
            height: 300
          },
          LARGE: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/457/457bd384cef4349ead70c38c010f352c-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=32cb3e68ca73903e8e2460591c938ca205600d752db962d6b5414e2691e6906a',
            width: 600,
            height: 600
          }
        },
        shareAs:
          'http://www.edamam.com/recipe/walnut-chorizo-baked-taquitos-45b78fb8a4b441bbb2de6c632b6c4a65/yum',
        yield: 20.0,
        ingredients: [
          {
            text: null,
            quantity: 3.0,
            measure: 'tablespoon',
            food: 'extra-virgin olive oil',
            weight: 40.5,
            foodCategory: 'Oils',
            foodId: 'food_b1d1icuad3iktrbqby0hiagafaz7',
            image:
              'https://www.edamam.com/food-img/4d6/4d651eaa8a353647746290c7a9b29d84.jpg'
          },
          {
            text: null,
            quantity: 2.5,
            measure: 'cup',
            food: 'walnuts',
            weight: 300.0,
            foodCategory: 'plant-based protein',
            foodId: 'food_acqkmojaw4fltga9jad8mb85u9z2',
            image:
              'https://www.edamam.com/food-img/624/6243d320d94b15ebaece2634cc5b40c5.jpg'
          },
          {
            text: null,
            quantity: 1.5,
            measure: 'teaspoon',
            food: 'smoked paprika',
            weight: 3.4499999999999997,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_a9dpcnjb883g67b3lq82ca0421ql',
            image:
              'https://www.edamam.com/food-img/474/474d63763b9d8b9da98c5f43a114648c.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'teaspoon',
            food: 'cumin',
            weight: 2.1,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_a8jjbx4biqndasapojdb5by3e92e',
            image:
              'https://www.edamam.com/food-img/07e/07e2a4eb77ce46591033846504817d35.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'teaspoon',
            food: 'chili powder',
            weight: 2.7,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_aii2sclb4r123rbfr2ybjasrl3nc',
            image:
              'https://www.edamam.com/food-img/e6f/e6f19043caefc23b5feda5520076617e.jpg'
          },
          {
            text: null,
            quantity: 0.5,
            measure: 'teaspoon',
            food: 'garlic powder',
            weight: 1.55,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_boq94r1a036492bdup9u1beyph0l',
            image:
              'https://www.edamam.com/food-img/5c3/5c3db1d5a1a16b1f0a74796f74dd5985.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'teaspoon',
            food: 'dried oregano',
            weight: 1.0,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_bkkw6v3bdf0sqiazmzyuiax7i8jr',
            image:
              'https://www.edamam.com/food-img/1b0/1b0eaffb1c261606e0d82fed8e9747a7.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'tablespoon',
            food: 'apple cider vinegar',
            weight: 29.8,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_ar8m7esapmfvf8bnhfzdlabndh6v',
            image:
              'https://www.edamam.com/food-img/c7d/c7dbd1846c5d08e9739930d70a404d50.jpg'
          },
          {
            text: null,
            quantity: 8.0,
            measure: 'ounce',
            food: 'cream cheese',
            weight: 226.796185,
            foodCategory: 'Cheese',
            foodId: 'food_a7rvc49a09a7yjbq3ekjbbauyoqa',
            image:
              'https://www.edamam.com/food-img/ddd/dddce306e7ee41e8e07dc62e28cab94b.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'cup',
            food: 'cheddar',
            weight: 226.0,
            foodCategory: 'Cheese',
            foodId: 'food_bhppgmha1u27voagb8eptbp9g376',
            image:
              'https://www.edamam.com/food-img/bcd/bcd94dde1fcde1475b5bf0540f821c5d.jpg'
          },
          {
            text: null,
            quantity: 0.0,
            measure: null,
            food: 'Kosher salt',
            weight: 9.383377110000001,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_a1vgrj1bs8rd1majvmd9ubz8ttkg',
            image:
              'https://www.edamam.com/food-img/694/6943ea510918c6025795e8dc6e6eaaeb.jpg'
          },
          {
            text: null,
            quantity: 0.0,
            measure: null,
            food: 'black pepper',
            weight: 4.691688555000001,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_b6ywzluaaxv02wad7s1r9ag4py89',
            image:
              'https://www.edamam.com/food-img/c6e/c6e5c3bd8d3bc15175d9766971a4d1b2.jpg'
          },
          {
            text: null,
            quantity: 20.0,
            measure: '<unit>',
            food: 'corn tortillas',
            weight: 480.0,
            foodCategory: 'quick breads and pastries',
            foodId: 'food_bhw0b95agm97s0abfignnb8fsvb3',
            image:
              'https://www.edamam.com/food-img/b8a/b8ad23dcc06f2324f944e47eb579d644.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'serving',
            food: 'lettuce',
            weight: 100.0,
            foodCategory: 'vegetables',
            foodId: 'food_bf5fxtkbc9alwoajuvsi7amonr5w',
            image:
              'https://www.edamam.com/food-img/719/71996625d0cb47e197093ecd52c97dc2.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'serving',
            food: 'Sour cream',
            weight: 15.0,
            foodCategory: 'Dairy',
            foodId: 'food_adp9fcubzl3lr7bcvzn3rbfiiiwq',
            image:
              'https://www.edamam.com/food-img/f9d/f9d6183267b041b0aff9a10b89c9c15f.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'serving',
            food: 'Pico de gallo',
            weight: 32.0,
            foodCategory: 'mixed soup',
            foodId: 'food_br5zuq6bae051qaqrjqjqbw549et',
            image:
              'https://www.edamam.com/food-img/1e9/1e99a7f6576e67cfa17419bff33d87bb.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'serving',
            food: 'radish',
            weight: 36.0,
            foodCategory: 'vegetables',
            foodId: 'food_bs6xkukbtd85e7b2lh5zfazpe45y',
            image:
              'https://www.edamam.com/food-img/ad7/ad78f4315cdba1dc26ccef0d7dba464b.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'serving',
            food: 'cilantro leaves',
            weight: 6.0,
            foodCategory: 'vegetables',
            foodId: 'food_alhzhuwb4lc7jnb5s6f02by60bzp',
            image:
              'https://www.edamam.com/food-img/d57/d57e375b6ff99a90c7ee2b1990a1af36.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'serving',
            food: 'queso fresco',
            weight: 61.0,
            foodCategory: 'Cheese',
            foodId: 'food_bfs6bdja03x1ambpc63a6av2y3ti',
            image:
              'https://www.edamam.com/food-img/050/050fcbd0a8b96e20d1725cf55c31413f.jpg'
          }
        ]
      },
      _links: {
        self: {
          href: 'https://api.edamam.com/api/recipes/v2/45b78fb8a4b441bbb2de6c632b6c4a65?app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0',
          title: 'Self'
        }
      }
    },
    {
      recipe: {
        uri: 'http://www.edamam.com/ontologies/edamam.owl#recipe_125a7c5dd61c328c78d0f781e5cd3d2f',
        label: 'Tom yum goong (hot and sour Thai prawn soup)',
        image:
          'https://edamam-product-images.s3.amazonaws.com/web-img/e9e/e9e321a2263e3b38efb175923b0bfaf4.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=ad330cbd943e02b30476fa43680960be7fcf009a440f427a432922fb831a628c',
        images: {
          THUMBNAIL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/e9e/e9e321a2263e3b38efb175923b0bfaf4-s.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=379fe9b07e333ba1696119e1a57c83da9f3b7f4b4a6c1087cb9bdce8bdaec919',
            width: 100,
            height: 100
          },
          SMALL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/e9e/e9e321a2263e3b38efb175923b0bfaf4-m.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=c78a377e22f4cd7e16f13a85a4f9b16e97c09c4f9dc3926a2c98237675bc65c0',
            width: 200,
            height: 200
          },
          REGULAR: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/e9e/e9e321a2263e3b38efb175923b0bfaf4.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3599&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=2e5a47ba5c593294271ed0c7d44e977cfb81a05162f7d1f160fb67da752de39c',
            width: 300,
            height: 300
          },
          LARGE: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/e9e/e9e321a2263e3b38efb175923b0bfaf4-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=921ed6604b5146d5680a583db68d10b5e37c57e1a5da5c3299b7a904504467c7',
            width: 600,
            height: 600
          }
        },
        shareAs:
          'http://www.edamam.com/recipe/tom-yum-goong-hot-and-sour-thai-prawn-soup-125a7c5dd61c328c78d0f781e5cd3d2f/yum',
        yield: 4.0,
        ingredients: [
          {
            text: null,
            quantity: 1.5,
            measure: 'liter',
            food: 'fish stock',
            weight: 1477.250116786766,
            foodCategory: 'canned soup',
            foodId: 'food_a00wj3maedk41kbwmbl4hb3s5gua',
            image:
              'https://www.edamam.com/food-img/e07/e07d7b7a8320da9f235be9d663b7a9f4.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'tablespoon',
            food: 'coriander',
            weight: 5.0,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_afpcy6rb44nx6gbfff63ga2cqksw',
            image:
              'https://www.edamam.com/food-img/a90/a901cee0b9028841d258f5d07b5924e7.jpg'
          },
          {
            text: null,
            quantity: 10.0,
            measure: '<unit>',
            food: 'lemon grass',
            weight: 200.0,
            foodCategory: 'vegetables',
            foodId: 'food_b3l1z8na3dy8qfaht3yubbrdu94h',
            image:
              'https://www.edamam.com/food-img/a6e/a6ef38b461759334bbdc4d25ca678ad1.jpg'
          },
          {
            text: null,
            quantity: 8.0,
            measure: '<unit>',
            food: 'kaffir lime leaves',
            weight: 4.8,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_b57357gbielvaeabp6wq8bwq55lz',
            image:
              'https://www.edamam.com/food-img/0f9/0f9f5f95df173e9ffaaff2977bef88f3.jpg'
          },
          {
            text: null,
            quantity: 8.0,
            measure: 'piece',
            food: 'fresh ginger',
            weight: 120.0,
            foodCategory: 'vegetables',
            foodId: 'food_bi2ki2xb5zmmvbaiwf7ztbgktzp6',
            image:
              'https://www.edamam.com/food-img/b9c/b9c06ef451ef29513880af0a53ebbaa6.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: '<unit>',
            food: 'chillies',
            weight: 90.0,
            foodCategory: 'vegetables',
            foodId: 'food_a6g98mqatzj7vca6ms3bnbzqxf3s',
            image:
              'https://www.edamam.com/food-img/469/469213672957a242638e20c27e3e8acd.jpeg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'tablespoon',
            food: 'fish sauce',
            weight: 18.0,
            foodCategory: 'canned soup',
            foodId: 'food_ahlu6u3ab8bu1wap7cbqua3s1quk',
            image:
              'https://www.edamam.com/food-img/7b5/7b58b769d8bf7b79acf12a76b79ea9bc.jpg'
          },
          {
            text: null,
            quantity: 840.0,
            measure: 'gram',
            food: 'prawns',
            weight: 840.0,
            foodCategory: 'seafood',
            foodId: 'food_b38bejhbq9loe2bbb7bnmbcpteft',
            image:
              'https://www.edamam.com/food-img/ebe/ebe2888b894f48d19762e1d606db0206.jpg'
          },
          {
            text: null,
            quantity: 8.0,
            measure: '<unit>',
            food: 'green onions',
            weight: 111.11111111111113,
            foodCategory: 'vegetables',
            foodId: 'food_bknlkyzbuzo27pb11whr4bttkuy6',
            image:
              'https://www.edamam.com/food-img/b89/b89986ed6aa466285bdd99bac34b3c46.jpg'
          },
          {
            text: null,
            quantity: 80.0,
            measure: 'milliliter',
            food: 'lime juice',
            weight: 83.31775193734116,
            foodCategory: 'fruit',
            foodId: 'food_b0iywbmaujvd4eblrooo9bsvn7e6',
            image:
              'https://www.edamam.com/food-img/8f0/8f0c10eb3dbf476a05e61018e76ea220.jpg'
          },
          {
            text: null,
            quantity: 0.6666666666666666,
            measure: 'cup',
            food: 'coriander leaves',
            weight: 10.666666666666666,
            foodCategory: 'vegetables',
            foodId: 'food_alhzhuwb4lc7jnb5s6f02by60bzp',
            image:
              'https://www.edamam.com/food-img/d57/d57e375b6ff99a90c7ee2b1990a1af36.jpg'
          },
          {
            text: null,
            quantity: 0.5,
            measure: 'cup',
            food: 'thai basil',
            weight: 12.0,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_bfeht3obd58c3gak5ehpibxgbbs6',
            image:
              'https://www.edamam.com/food-img/5f1/5f1b05685ac2b404236a5d1c1f3c8c10.jpg'
          }
        ]
      },
      _links: {
        self: {
          href: 'https://api.edamam.com/api/recipes/v2/125a7c5dd61c328c78d0f781e5cd3d2f?app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0',
          title: 'Self'
        }
      }
    },
    {
      recipe: {
        uri: 'http://www.edamam.com/ontologies/edamam.owl#recipe_a95b8fad4dedb9904071fdce2aa3e85e',
        label: 'Thai Hot and Sour Soup',
        image:
          'https://edamam-product-images.s3.amazonaws.com/web-img/952/952c8f8559d76be447a819d0075579c2.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d62443c8de5700bc090db02543f1bba6b954dc74408a949a5d928a676d6b7b75',
        images: {
          THUMBNAIL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/952/952c8f8559d76be447a819d0075579c2-s.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7594dee41f00152931b0d95cc75bfbd55b2fd56b333c2b2def5d33a27cd52410',
            width: 100,
            height: 100
          },
          SMALL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/952/952c8f8559d76be447a819d0075579c2-m.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=de6305f496a4dd4ab0f0710d37079ff3e0508d815758ecd105e616537ed70765',
            width: 200,
            height: 200
          },
          REGULAR: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/952/952c8f8559d76be447a819d0075579c2.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d62443c8de5700bc090db02543f1bba6b954dc74408a949a5d928a676d6b7b75',
            width: 300,
            height: 300
          },
          LARGE: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/952/952c8f8559d76be447a819d0075579c2-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=cabdeaa477945b92654a4756388b63067322ad07fad131161441a52ff5c2d75c',
            width: 600,
            height: 600
          }
        },
        shareAs:
          'http://www.edamam.com/recipe/thai-hot-and-sour-soup-a95b8fad4dedb9904071fdce2aa3e85e/yum',
        yield: 6.0,
        ingredients: [
          {
            text: null,
            quantity: 3.0,
            measure: 'cup',
            food: 'chicken stock',
            weight: 720.0,
            foodCategory: 'canned soup',
            foodId: 'food_bptblvzambd16nbhewqmhaw1rnh5',
            image:
              'https://www.edamam.com/food-img/26a/26a10c4cb4e07bab54d8a687ef5ac7d8.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'tablespoon',
            food: 'tom yum paste',
            weight: 13.999999999763302,
            foodCategory: null,
            foodId: 'food_amnjertashbzzhat2fq8zbv6ax4q',
            image: null
          },
          {
            text: null,
            quantity: 0.5,
            measure: 'clove',
            food: 'garlic',
            weight: 1.5,
            foodCategory: 'vegetables',
            foodId: 'food_avtcmx6bgjv1jvay6s6stan8dnyp',
            image:
              'https://www.edamam.com/food-img/6ee/6ee142951f48aaf94f4312409f8d133d.jpg'
          },
          {
            text: null,
            quantity: 3.0,
            measure: 'stalk',
            food: 'lemongrass',
            weight: 60.0,
            foodCategory: 'vegetables',
            foodId: 'food_b3l1z8na3dy8qfaht3yubbrdu94h',
            image:
              'https://www.edamam.com/food-img/a6e/a6ef38b461759334bbdc4d25ca678ad1.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: '<unit>',
            food: 'kaffir lime leaves',
            weight: 1.2,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_b57357gbielvaeabp6wq8bwq55lz',
            image:
              'https://www.edamam.com/food-img/0f9/0f9f5f95df173e9ffaaff2977bef88f3.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'half',
            food: 'chicken breast',
            weight: 272.0,
            foodCategory: 'Poultry',
            foodId: 'food_bdrxu94aj3x2djbpur8dhagfhkcn',
            image:
              'https://www.edamam.com/food-img/da5/da510379d3650787338ca16fb69f4c94.jpg'
          },
          {
            text: null,
            quantity: 4.0,
            measure: 'ounce',
            food: 'mushrooms',
            weight: 113.3980925,
            foodCategory: 'vegetables',
            foodId: 'food_bvlose6arfl26ra396sjrb7hetqh',
            image:
              'https://www.edamam.com/food-img/d63/d639cf4a2afc7407c1d1ce286028136b.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'tablespoon',
            food: 'fish sauce',
            weight: 18.0,
            foodCategory: 'canned soup',
            foodId: 'food_ahlu6u3ab8bu1wap7cbqua3s1quk',
            image:
              'https://www.edamam.com/food-img/7b5/7b58b769d8bf7b79acf12a76b79ea9bc.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'tablespoon',
            food: 'lime juice',
            weight: 15.399999999739633,
            foodCategory: 'fruit',
            foodId: 'food_b0iywbmaujvd4eblrooo9bsvn7e6',
            image:
              'https://www.edamam.com/food-img/8f0/8f0c10eb3dbf476a05e61018e76ea220.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'teaspoon',
            food: 'green chili pepper',
            weight: 2.8958333334802133,
            foodCategory: 'canned vegetables',
            foodId: 'food_acyan5ha6i5vuoazc71xdaevlntx',
            image:
              'https://www.edamam.com/food-img/25b/25b66567f5c22b8327f3eee708ce2c74.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'bunch',
            food: 'fresh coriander',
            weight: 40.0,
            foodCategory: 'vegetables',
            foodId: 'food_alhzhuwb4lc7jnb5s6f02by60bzp',
            image:
              'https://www.edamam.com/food-img/d57/d57e375b6ff99a90c7ee2b1990a1af36.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'sprig',
            food: 'fresh basil',
            weight: 2.0,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_bfeht3obd58c3gak5ehpibxgbbs6',
            image:
              'https://www.edamam.com/food-img/5f1/5f1b05685ac2b404236a5d1c1f3c8c10.jpg'
          }
        ]
      },
      _links: {
        self: {
          href: 'https://api.edamam.com/api/recipes/v2/a95b8fad4dedb9904071fdce2aa3e85e?app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0',
          title: 'Self'
        }
      }
    },
    {
      recipe: {
        uri: 'http://www.edamam.com/ontologies/edamam.owl#recipe_46b3bdb66fa7113b88cb1953cb424c4f',
        label: 'French Style Creamy Chicken & Veggies',
        image:
          'https://edamam-product-images.s3.amazonaws.com/web-img/8d6/8d6cafb7767dbce5116236844f7d7bba?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d0983993fd6920de94a54483d0d08ce5c11fda0118cb7444d0036fb92534053f',
        images: {
          THUMBNAIL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/8d6/8d6cafb7767dbce5116236844f7d7bba-s?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=013596d94335eaa8de79d052f1769403391af05ed1a080caf09a7011fa9023c4',
            width: 100,
            height: 100
          },
          SMALL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/8d6/8d6cafb7767dbce5116236844f7d7bba-m?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=de56d44916ebe310046cf25769f64527149635a6324a9ff0bad71add776b3f18',
            width: 200,
            height: 200
          },
          REGULAR: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/8d6/8d6cafb7767dbce5116236844f7d7bba?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d0983993fd6920de94a54483d0d08ce5c11fda0118cb7444d0036fb92534053f',
            width: 300,
            height: 300
          },
          LARGE: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/8d6/8d6cafb7767dbce5116236844f7d7bba-l?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=5ab66fb45dd53ee85b5dce6782bf3f1d6169efcd92def85784af6c8c72c75960',
            width: 600,
            height: 600
          }
        },
        shareAs:
          'http://www.edamam.com/recipe/french-style-creamy-chicken-veggies-46b3bdb66fa7113b88cb1953cb424c4f/yum',
        yield: 6.0,
        ingredients: [
          {
            text: null,
            quantity: 6.0,
            measure: '<unit>',
            food: 'chicken thighs',
            weight: 1158.0,
            foodCategory: 'Poultry',
            foodId: 'food_bsarl08be0gwarb34bpviafna9d4',
            image:
              'https://www.edamam.com/food-img/007/00792642367e1f55de680762f85cfb3b.jpg'
          },
          {
            text: null,
            quantity: 0.0,
            measure: null,
            food: 'salt',
            weight: 15.207727109998412,
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
            weight: 7.603863554999206,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_b6ywzluaaxv02wad7s1r9ag4py89',
            image:
              'https://www.edamam.com/food-img/c6e/c6e5c3bd8d3bc15175d9766971a4d1b2.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'tablespoon',
            food: 'olive oil',
            weight: 27.0,
            foodCategory: 'Oils',
            foodId: 'food_b1d1icuad3iktrbqby0hiagafaz7',
            image:
              'https://www.edamam.com/food-img/4d6/4d651eaa8a353647746290c7a9b29d84.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'tablespoon',
            food: 'butter',
            weight: 28.4,
            foodCategory: 'Dairy',
            foodId: 'food_awz3iefajbk1fwahq9logahmgltj',
            image:
              'https://www.edamam.com/food-img/713/71397239b670d88c04faa8d05035cab4.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: '<unit>',
            food: 'onion',
            weight: 150.0,
            foodCategory: 'vegetables',
            foodId: 'food_bmrvi4ob4binw9a5m7l07amlfcoy',
            image:
              'https://www.edamam.com/food-img/205/205e6bf2399b85d34741892ef91cc603.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: '<unit>',
            food: 'carrot',
            weight: 72.0,
            foodCategory: 'vegetables',
            foodId: 'food_ai215e5b85pdh5ajd4aafa3w2zm8',
            image:
              'https://www.edamam.com/food-img/121/121e33fce0bb9546ed7d060b6c114e29.jpg'
          },
          {
            text: null,
            quantity: 8.0,
            measure: 'ounce',
            food: 'mushrooms',
            weight: 226.796185,
            foodCategory: 'vegetables',
            foodId: 'food_bvlose6arfl26ra396sjrb7hetqh',
            image:
              'https://www.edamam.com/food-img/d63/d639cf4a2afc7407c1d1ce286028136b.jpg'
          },
          {
            text: null,
            quantity: 4.0,
            measure: 'clove',
            food: 'garlic',
            weight: 12.0,
            foodCategory: 'vegetables',
            foodId: 'food_avtcmx6bgjv1jvay6s6stan8dnyp',
            image:
              'https://www.edamam.com/food-img/6ee/6ee142951f48aaf94f4312409f8d133d.jpg'
          },
          {
            text: null,
            quantity: 0.5,
            measure: 'cup',
            food: 'white wine',
            weight: 117.6,
            foodCategory: 'wines',
            foodId: 'food_bn44h7baron9ufaoxinmya8l0yye',
            image:
              'https://www.edamam.com/food-img/a71/a718cf3c52add522128929f1f324d2ab.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'tablespoon',
            food: 'flour',
            weight: 15.624999999735829,
            foodCategory: 'grains',
            foodId: 'food_ahebfs0a985an4aubqaebbipra58',
            image:
              'https://www.edamam.com/food-img/b4c/b4c739e76a6f2172b7ad49d0aa41d5aa.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'cup',
            food: 'chicken broth',
            weight: 480.0,
            foodCategory: 'canned soup',
            foodId: 'food_bptblvzambd16nbhewqmhaw1rnh5',
            image:
              'https://www.edamam.com/food-img/26a/26a10c4cb4e07bab54d8a687ef5ac7d8.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'cup',
            food: 'heavy cream',
            weight: 238.0,
            foodCategory: 'Dairy',
            foodId: 'food_bgtkr21b5v16mca246x9ebnaswyo',
            image:
              'https://www.edamam.com/food-img/484/4848d71f6a14dd5076083f5e17925420.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'tablespoon',
            food: 'parsley',
            weight: 7.6,
            foodCategory: 'vegetables',
            foodId: 'food_b244pqdazw24zobr5vqu2bf0uid8',
            image:
              'https://www.edamam.com/food-img/46a/46a132e96626d7989b4d6ed8c91f4da0.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'teaspoon',
            food: 'fresh thyme',
            weight: 1.6,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_b3o3cj7a5gskecb0ufphtadnbfqb',
            image:
              'https://www.edamam.com/food-img/3e7/3e7cf3c8d767a90b906447f5e74059f7.jpg'
          }
        ]
      },
      _links: {
        self: {
          href: 'https://api.edamam.com/api/recipes/v2/46b3bdb66fa7113b88cb1953cb424c4f?app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0',
          title: 'Self'
        }
      }
    },
    {
      recipe: {
        uri: 'http://www.edamam.com/ontologies/edamam.owl#recipe_918d6b445ae84b68ba68b0e400f20f62',
        label: 'Farro Salad with Balsamic Roasted Vegetables',
        image:
          'https://edamam-product-images.s3.amazonaws.com/web-img/e08/e08f81bfabd8a927e76711d7d8dd90cb.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=61da041802eb9e7e9fe1ff53121516f55ad2ba978f4bc0bd169058b93fc07e5e',
        images: {
          THUMBNAIL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/e08/e08f81bfabd8a927e76711d7d8dd90cb-s.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=459b9fd973f83615f4a8c3d25bd29743dd1aab04ef3728775182c860b5a6cfeb',
            width: 100,
            height: 100
          },
          SMALL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/e08/e08f81bfabd8a927e76711d7d8dd90cb-m.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=8e3f6fdefbdee3b7ec197f4236d3c7a80a1639b06d8709584615337ae7ebf269',
            width: 200,
            height: 200
          },
          REGULAR: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/e08/e08f81bfabd8a927e76711d7d8dd90cb.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=61da041802eb9e7e9fe1ff53121516f55ad2ba978f4bc0bd169058b93fc07e5e',
            width: 300,
            height: 300
          },
          LARGE: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/e08/e08f81bfabd8a927e76711d7d8dd90cb-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=558477df2b9b9cc1a3e73a266674118a538b67fc5542751c605c88866617f40a',
            width: 600,
            height: 600
          }
        },
        shareAs:
          'http://www.edamam.com/recipe/farro-salad-with-balsamic-roasted-vegetables-918d6b445ae84b68ba68b0e400f20f62/yum',
        yield: 6.0,
        ingredients: [
          {
            text: null,
            quantity: 1.0,
            measure: 'pint',
            food: 'button mushrooms',
            weight: 140.0,
            foodCategory: 'vegetables',
            foodId: 'food_bvlose6arfl26ra396sjrb7hetqh',
            image:
              'https://www.edamam.com/food-img/d63/d639cf4a2afc7407c1d1ce286028136b.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: '<unit>',
            food: 'yellow bell peppers',
            weight: 372.0,
            foodCategory: 'vegetables',
            foodId: 'food_azxdee4b77a6m1bgwceioa3g8bgc',
            image:
              'https://www.edamam.com/food-img/e1a/e1a4da15c9ebffb004cf36c5c51de9df.jpeg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: '<unit>',
            food: 'red onion',
            weight: 125.0,
            foodCategory: 'vegetables',
            foodId: 'food_bmrvi4ob4binw9a5m7l07amlfcoy',
            image:
              'https://www.edamam.com/food-img/205/205e6bf2399b85d34741892ef91cc603.jpg'
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
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'tablespoon',
            food: 'olive oil',
            weight: 13.5,
            foodCategory: 'Oils',
            foodId: 'food_b1d1icuad3iktrbqby0hiagafaz7',
            image:
              'https://www.edamam.com/food-img/4d6/4d651eaa8a353647746290c7a9b29d84.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'tablespoon',
            food: 'balsamic vinegar',
            weight: 16.0,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_b1ic8tzapja8jubas1f8lbhpbn6x',
            image:
              'https://www.edamam.com/food-img/90a/90a1f211768e166ecfff19e8b4747498.jpg'
          },
          {
            text: null,
            quantity: 1.5,
            measure: 'cup',
            food: 'farro',
            weight: 261.0,
            foodCategory: 'grains',
            foodId: 'food_bulq1w3a0qy4x4af2vjawbccp4yw',
            image:
              'https://www.edamam.com/food-img/444/4447177f55469aafd3a7656bf06315b2.jpg'
          },
          {
            text: null,
            quantity: 3.0,
            measure: 'tablespoon',
            food: 'lemon juice',
            weight: 45.75,
            foodCategory: '100% juice',
            foodId: 'food_bglm6vxahuauteb0n6ynfbg9eryu',
            image:
              'https://www.edamam.com/food-img/e31/e310952d214e78a4cb8b73f30ceeaaf2.jpg'
          },
          {
            text: null,
            quantity: 0.5,
            measure: 'cup',
            food: 'canola oil',
            weight: 109.0,
            foodCategory: 'Oils',
            foodId: 'food_bk9p9aaavhvoq4bqsnprobpsiuxs',
            image:
              'https://www.edamam.com/food-img/07e/07e106ab3536d57428e5c46d009038f8.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'tablespoon',
            food: 'parsley',
            weight: 3.8,
            foodCategory: 'vegetables',
            foodId: 'food_b244pqdazw24zobr5vqu2bf0uid8',
            image:
              'https://www.edamam.com/food-img/46a/46a132e96626d7989b4d6ed8c91f4da0.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'tablespoon',
            food: 'tarragon',
            weight: 2.5,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_bcae9pdaob9i69bo94oxramms336',
            image:
              'https://www.edamam.com/food-img/22f/22f8945d157d8b759c30e6738639991b.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'tablespoon',
            food: 'honey',
            weight: 21.0,
            foodCategory: 'sugar syrups',
            foodId: 'food_b1cj2pmac27zngan87974b0a40hk',
            image:
              'https://www.edamam.com/food-img/198/198c7b25c23b4235b4cc33818c7b335f.jpg'
          }
        ]
      },
      _links: {
        self: {
          href: 'https://api.edamam.com/api/recipes/v2/918d6b445ae84b68ba68b0e400f20f62?app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0',
          title: 'Self'
        }
      }
    },
    {
      recipe: {
        uri: 'http://www.edamam.com/ontologies/edamam.owl#recipe_3d439ae101e3a0314cc2f7c61af132e4',
        label: 'Holy Yum Chicken',
        image:
          'https://edamam-product-images.s3.amazonaws.com/web-img/830/83000389a18a12ed0952101d57d63aaa.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=e4f990ce55ebcfb654d9c2325870463d6c6ace85c3ba750e3d818abb1c1b72bc',
        images: {
          THUMBNAIL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/830/83000389a18a12ed0952101d57d63aaa-s.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=48bf768f5ec1aa4a5226bb377cb76501756f54296ffba95bb054c8774d3fb002',
            width: 100,
            height: 100
          },
          SMALL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/830/83000389a18a12ed0952101d57d63aaa-m.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=21bfce7809483e094010b7525fa670af5fc9592af6383efa247dbee5e00e67d2',
            width: 200,
            height: 200
          },
          REGULAR: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/830/83000389a18a12ed0952101d57d63aaa.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=e4f990ce55ebcfb654d9c2325870463d6c6ace85c3ba750e3d818abb1c1b72bc',
            width: 300,
            height: 300
          },
          LARGE: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/830/83000389a18a12ed0952101d57d63aaa-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=d35dcba358044c022d3f816b54ddfe1b0f2c846a5ee8c7cc87a6803a11e6c0c1',
            width: 600,
            height: 600
          }
        },
        shareAs:
          'http://www.edamam.com/recipe/holy-yum-chicken-3d439ae101e3a0314cc2f7c61af132e4/yum',
        yield: 8.0,
        ingredients: [
          {
            text: null,
            quantity: 1.75,
            measure: 'pound',
            food: 'chicken thighs',
            weight: 793.7866475000001,
            foodCategory: 'Poultry',
            foodId: 'food_bsarl08be0gwarb34bpviafna9d4',
            image:
              'https://www.edamam.com/food-img/007/00792642367e1f55de680762f85cfb3b.jpg'
          },
          {
            text: null,
            quantity: 0.5,
            measure: 'cup',
            food: 'Dijon mustard',
            weight: 124.5,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_a34cdj5b0kyuhfbov30xcb50u4dv',
            image:
              'https://www.edamam.com/food-img/e23/e238f2e4cfa6aa1a30f46dc73e7344eb.jpg'
          },
          {
            text: null,
            quantity: 0.25,
            measure: 'cup',
            food: 'maple syrup',
            weight: 78.75,
            foodCategory: 'sugars',
            foodId: 'food_bo37p69bopqshvaul0bn4bv0kqni',
            image:
              'https://www.edamam.com/food-img/ced/ced25c45453a118e531c8aaf33e2ee38.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'tablespoon',
            food: 'rice wine vinegar',
            weight: 14.9,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_axlcd4tack2d20bveizm4ayu0h2w',
            image:
              'https://www.edamam.com/food-img/5f6/5f69b84c399d778c4728e9ab4f8065a2.jpg'
          },
          {
            text: null,
            quantity: 0.25,
            measure: 'teaspoon',
            food: 'salt',
            weight: 1.5,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_btxz81db72hwbra2pncvebzzzum9',
            image:
              'https://www.edamam.com/food-img/694/6943ea510918c6025795e8dc6e6eaaeb.jpg'
          },
          {
            text: null,
            quantity: 0.25,
            measure: 'teaspoon',
            food: 'black pepper',
            weight: 0.575,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_b6ywzluaaxv02wad7s1r9ag4py89',
            image:
              'https://www.edamam.com/food-img/c6e/c6e5c3bd8d3bc15175d9766971a4d1b2.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'tablespoon',
            food: 'cornstarch',
            weight: 7.999999999864745,
            foodCategory: 'grains',
            foodId: 'food_a6r17hrba37cqeabesko5a2gk233',
            image:
              'https://www.edamam.com/food-img/f9b/f9b74d9495b40c0aea955c37a1fc39dc.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'teaspoon',
            food: 'fresh rosemary',
            weight: 1.4,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_b6tm2t2blxi7okaeiv91wb8bmygq',
            image:
              'https://www.edamam.com/food-img/0ac/0ac8f7cf6f2d0ad7b1a2f9900fae44f3.jpg'
          }
        ]
      },
      _links: {
        self: {
          href: 'https://api.edamam.com/api/recipes/v2/3d439ae101e3a0314cc2f7c61af132e4?app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0',
          title: 'Self'
        }
      }
    },
    {
      recipe: {
        uri: 'http://www.edamam.com/ontologies/edamam.owl#recipe_057e21bc788d4f46852b58ae0f59801c',
        label: 'Yum yums',
        image:
          'https://edamam-product-images.s3.amazonaws.com/web-img/23b/23b2d65cf9450a02e23684062f43caa5.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=b30d35e2c03d0dc5668b234cdc6401086d562bf56c2d9ceba8eadffca708f32a',
        images: {
          THUMBNAIL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/23b/23b2d65cf9450a02e23684062f43caa5-s.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=0cefd8a728d2a88aa347370eff5dac9888592e31ed4720771545826314e73155',
            width: 100,
            height: 100
          },
          SMALL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/23b/23b2d65cf9450a02e23684062f43caa5-m.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=a3b1b7047850577ef5d259973d087a4e75b4d57d3c17404f56ea7b5a4aa5025e',
            width: 200,
            height: 200
          },
          REGULAR: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/23b/23b2d65cf9450a02e23684062f43caa5.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=b30d35e2c03d0dc5668b234cdc6401086d562bf56c2d9ceba8eadffca708f32a',
            width: 300,
            height: 300
          },
          LARGE: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/23b/23b2d65cf9450a02e23684062f43caa5-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=3dfd993d8885bee66d89c9c77466adc0acfe1ea0105038987593a2264e79f698',
            width: 600,
            height: 600
          }
        },
        shareAs:
          'http://www.edamam.com/recipe/yum-yums-057e21bc788d4f46852b58ae0f59801c/yum',
        yield: 12.0,
        ingredients: [
          {
            text: null,
            quantity: 500.0,
            measure: 'gram',
            food: 'bread flour',
            weight: 500.0,
            foodCategory: 'grains',
            foodId: 'food_b5xk0gwa3clakbaap10sta82dgdk',
            image:
              'https://www.edamam.com/food-img/132/1328fd505cdd3b75fbb8d7b58de5427c.jpg'
          },
          {
            text: null,
            quantity: 10.0,
            measure: 'gram',
            food: 'yeast',
            weight: 10.0,
            foodCategory: 'condiments and sauces',
            foodId: 'food_a2xisx4br72i19btvvxgzayoelqj',
            image:
              'https://www.edamam.com/food-img/433/433749733fd8a22560cdb451b1317be1.jpg'
          },
          {
            text: null,
            quantity: 75.0,
            measure: 'gram',
            food: 'caster sugar',
            weight: 75.0,
            foodCategory: 'sugars',
            foodId: 'food_b83hz1dbrydiwzag8btahb15lu4l',
            image:
              'https://www.edamam.com/food-img/ecb/ecb3f5aaed96d0188c21b8369be07765.jpg'
          },
          {
            text: null,
            quantity: 75.0,
            measure: 'gram',
            food: 'salted butter',
            weight: 75.0,
            foodCategory: 'Dairy',
            foodId: 'food_axwam0ga2lqqlabfq1kqtbloozm3',
            image:
              'https://www.edamam.com/food-img/515/515af390107678fce1533a31ee4cc35b.jpeg'
          },
          {
            text: null,
            quantity: 100.0,
            measure: 'milliliter',
            food: 'whole milk',
            weight: 103.13276924062113,
            foodCategory: 'Milk',
            foodId: 'food_b49rs1kaw0jktabzkg2vvanvvsis',
            image:
              'https://www.edamam.com/food-img/7c9/7c9962acf83654a8d98ea6a2ade93735.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: '<unit>',
            food: 'egg',
            weight: 43.0,
            foodCategory: 'Eggs',
            foodId: 'food_bhpradua77pk16aipcvzeayg732r',
            image:
              'https://www.edamam.com/food-img/a7e/a7ec7c337cb47c6550b3b118e357f077.jpg'
          },
          {
            text: null,
            quantity: 0.0,
            measure: null,
            food: 'vegetable oil',
            weight: 10.963405661672446,
            foodCategory: 'Oils',
            foodId: 'food_bt1mzi2ah2sfg8bv7no1qai83w8s',
            image:
              'https://www.edamam.com/food-img/6e5/6e51a63a6300a8ea1b4c4cc68dfaba33.jpg'
          }
        ]
      },
      _links: {
        self: {
          href: 'https://api.edamam.com/api/recipes/v2/057e21bc788d4f46852b58ae0f59801c?app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0',
          title: 'Self'
        }
      }
    },
    {
      recipe: {
        uri: 'http://www.edamam.com/ontologies/edamam.owl#recipe_4f83c01f6b11beeae1c74c4306e43a52',
        label: 'Hot and sour chicken soup',
        image:
          'https://edamam-product-images.s3.amazonaws.com/web-img/2af/2af8bc3f42addc718e91041930e09095.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7e970aeb5f2f1f735847f7cdbd6ba3e8249821aba5ed1b02b6f67f7c0fc1be22',
        images: {
          THUMBNAIL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/2af/2af8bc3f42addc718e91041930e09095-s.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=8302feaee9d13783dbb972cdf3a504cdc86c36ea317107296fe070af35978073',
            width: 100,
            height: 100
          },
          SMALL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/2af/2af8bc3f42addc718e91041930e09095-m.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=a7400b5fa6e148fe1f5ee10e6511d7de68e25fa465d1945afe46c3853f950aa0',
            width: 200,
            height: 200
          },
          REGULAR: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/2af/2af8bc3f42addc718e91041930e09095.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=7e970aeb5f2f1f735847f7cdbd6ba3e8249821aba5ed1b02b6f67f7c0fc1be22',
            width: 300,
            height: 300
          },
          LARGE: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/2af/2af8bc3f42addc718e91041930e09095-l.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=40b84fe4ce17bcc9125508f0c684918bb058afc2ed1ef2b44635e0faa62537e2',
            width: 600,
            height: 600
          }
        },
        shareAs:
          'http://www.edamam.com/recipe/hot-and-sour-chicken-soup-4f83c01f6b11beeae1c74c4306e43a52/yum',
        yield: 4.0,
        ingredients: [
          {
            text: null,
            quantity: 3.0,
            measure: 'tablespoon',
            food: 'tom yum paste',
            weight: 41.999999999289905,
            foodCategory: null,
            foodId: 'food_amnjertashbzzhat2fq8zbv6ax4q',
            image: null
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'liter',
            food: 'stock',
            weight: 1014.42068105529,
            foodCategory: 'canned soup',
            foodId: 'food_bptblvzambd16nbhewqmhaw1rnh5',
            image:
              'https://www.edamam.com/food-img/26a/26a10c4cb4e07bab54d8a687ef5ac7d8.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'tablespoon',
            food: 'brown sugar',
            weight: 18.12499999969356,
            foodCategory: 'sugars',
            foodId: 'food_aodgtqwbmeu5f6bxeffn0art3bga',
            image:
              'https://www.edamam.com/food-img/8c6/8c6662bd73900645c6385b51a95d9b03.jpg'
          },
          {
            text: null,
            quantity: 500.0,
            measure: 'gram',
            food: 'chicken breast',
            weight: 500.0,
            foodCategory: 'Poultry',
            foodId: 'food_bdrxu94aj3x2djbpur8dhagfhkcn',
            image:
              'https://www.edamam.com/food-img/da5/da510379d3650787338ca16fb69f4c94.jpg'
          },
          {
            text: null,
            quantity: 425.0,
            measure: 'gram',
            food: 'straw mushrooms',
            weight: 425.0,
            foodCategory: 'canned vegetables',
            foodId: 'food_ayu3bksbbzrfnybf7y0b6a6iif0i',
            image: null
          },
          {
            text: null,
            quantity: 125.0,
            measure: 'milliliter',
            food: 'lemon juice',
            weight: 128.91596155077642,
            foodCategory: '100% juice',
            foodId: 'food_bglm6vxahuauteb0n6ynfbg9eryu',
            image:
              'https://www.edamam.com/food-img/e31/e310952d214e78a4cb8b73f30ceeaaf2.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'cup',
            food: 'bean sprouts',
            weight: 208.0,
            foodCategory: 'vegetables',
            foodId: 'food_a8l38voaf1algubwcsji2a8z2yh3',
            image:
              'https://www.edamam.com/food-img/ad4/ad4635efc3493d3b4f59f6479c1bd27b.jpg'
          },
          {
            text: null,
            quantity: 3.0,
            measure: '<unit>',
            food: 'spring onions',
            weight: 41.66666666666667,
            foodCategory: 'vegetables',
            foodId: 'food_bknlkyzbuzo27pb11whr4bttkuy6',
            image:
              'https://www.edamam.com/food-img/b89/b89986ed6aa466285bdd99bac34b3c46.jpg'
          }
        ]
      },
      _links: {
        self: {
          href: 'https://api.edamam.com/api/recipes/v2/4f83c01f6b11beeae1c74c4306e43a52?app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0',
          title: 'Self'
        }
      }
    },
    {
      recipe: {
        uri: 'http://www.edamam.com/ontologies/edamam.owl#recipe_f4ab9bff279ab76d9fb0c2f201b4dc55',
        label: 'Tom yum goong',
        image:
          'https://edamam-product-images.s3.amazonaws.com/web-img/1fe/1fee77f3541f7974a33681b3828c81e8.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=ac5f4195158e0252703002cf367f020bf7365460926a7c37e18ab692280bc977',
        images: {
          THUMBNAIL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/1fe/1fee77f3541f7974a33681b3828c81e8-s.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=f6f0f3faf6ee7e18ffbda01281fe4159d7fed69881bee4d7b7e42a4f856083a5',
            width: 100,
            height: 100
          },
          SMALL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/1fe/1fee77f3541f7974a33681b3828c81e8-m.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=37bd294deb7ce3bfc7dad1182855d049a1e4beb7fed915212e2a80286e776ede',
            width: 200,
            height: 200
          },
          REGULAR: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/1fe/1fee77f3541f7974a33681b3828c81e8.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=ac5f4195158e0252703002cf367f020bf7365460926a7c37e18ab692280bc977',
            width: 300,
            height: 300
          },
          LARGE: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/1fe/1fee77f3541f7974a33681b3828c81e8-l.jpeg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=412486d5054680e7923e222f38dfe6f510ac5dc09606f018596d84dfd5d39fbe',
            width: 600,
            height: 600
          }
        },
        shareAs:
          'http://www.edamam.com/recipe/tom-yum-goong-f4ab9bff279ab76d9fb0c2f201b4dc55/yum',
        yield: 4.0,
        ingredients: [
          {
            text: null,
            quantity: 1.5,
            measure: 'tablespoon',
            food: 'red curry paste',
            weight: 24.0,
            foodCategory: 'condiments and sauces',
            foodId: 'food_aojdol2are6zg7af2nincbe87jot',
            image:
              'https://www.edamam.com/food-img/b6a/b6a9ebae5850f42eca0253827603ef9c.jpg'
          },
          {
            text: null,
            quantity: 6.0,
            measure: 'cup',
            food: 'stock',
            weight: 1440.0,
            foodCategory: 'canned soup',
            foodId: 'food_bptblvzambd16nbhewqmhaw1rnh5',
            image:
              'https://www.edamam.com/food-img/26a/26a10c4cb4e07bab54d8a687ef5ac7d8.jpg'
          },
          {
            text: null,
            quantity: 16.0,
            measure: '<unit>',
            food: 'prawns',
            weight: 96.0,
            foodCategory: 'seafood',
            foodId: 'food_b38bejhbq9loe2bbb7bnmbcpteft',
            image:
              'https://www.edamam.com/food-img/ebe/ebe2888b894f48d19762e1d606db0206.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'tablespoon',
            food: 'lime juice',
            weight: 15.399999999739633,
            foodCategory: 'fruit',
            foodId: 'food_b0iywbmaujvd4eblrooo9bsvn7e6',
            image:
              'https://www.edamam.com/food-img/8f0/8f0c10eb3dbf476a05e61018e76ea220.jpg'
          },
          {
            text: null,
            quantity: 3.0,
            measure: 'teaspoon',
            food: 'fish sauce',
            weight: 18.000000001217305,
            foodCategory: 'canned soup',
            foodId: 'food_ahlu6u3ab8bu1wap7cbqua3s1quk',
            image:
              'https://www.edamam.com/food-img/7b5/7b58b769d8bf7b79acf12a76b79ea9bc.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: '<unit>',
            food: 'green onions',
            weight: 27.777777777777782,
            foodCategory: 'vegetables',
            foodId: 'food_bknlkyzbuzo27pb11whr4bttkuy6',
            image:
              'https://www.edamam.com/food-img/b89/b89986ed6aa466285bdd99bac34b3c46.jpg'
          },
          {
            text: null,
            quantity: 0.0,
            measure: null,
            food: 'Salt',
            weight: 9.727066666672409,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_btxz81db72hwbra2pncvebzzzum9',
            image:
              'https://www.edamam.com/food-img/694/6943ea510918c6025795e8dc6e6eaaeb.jpg'
          },
          {
            text: null,
            quantity: 0.0,
            measure: null,
            food: 'black pepper',
            weight: 4.863533333336204,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_b6ywzluaaxv02wad7s1r9ag4py89',
            image:
              'https://www.edamam.com/food-img/c6e/c6e5c3bd8d3bc15175d9766971a4d1b2.jpg'
          },
          {
            text: null,
            quantity: 0.0,
            measure: null,
            food: 'coriander leaves',
            weight: 16.211777777787347,
            foodCategory: 'vegetables',
            foodId: 'food_alhzhuwb4lc7jnb5s6f02by60bzp',
            image:
              'https://www.edamam.com/food-img/d57/d57e375b6ff99a90c7ee2b1990a1af36.jpg'
          }
        ]
      },
      _links: {
        self: {
          href: 'https://api.edamam.com/api/recipes/v2/f4ab9bff279ab76d9fb0c2f201b4dc55?app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0',
          title: 'Self'
        }
      }
    },
    {
      recipe: {
        uri: 'http://www.edamam.com/ontologies/edamam.owl#recipe_6929610095cf45a3b55eff00864af069',
        label: 'Peanut Butter Fudge- Yum',
        image:
          'https://edamam-product-images.s3.amazonaws.com/web-img/8a2/8a2441b65b1a639861807c4f54b5ca5a.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=6e540e08b1e00c65e21dec65948fc40aba9e981c91a66686313e7c5c959a6271',
        images: {
          THUMBNAIL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/8a2/8a2441b65b1a639861807c4f54b5ca5a-s.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=58dbde7ac30969046bdf6fab9183e3a8af7fd9a9550dbe5c3f5d16b462d973d6',
            width: 100,
            height: 100
          },
          SMALL: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/8a2/8a2441b65b1a639861807c4f54b5ca5a-m.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=3f994756db14fb58d322b6ede615cee8243075a6f3194c76e33ccf21ff96fd7a',
            width: 200,
            height: 200
          },
          REGULAR: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/8a2/8a2441b65b1a639861807c4f54b5ca5a.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=6e540e08b1e00c65e21dec65948fc40aba9e981c91a66686313e7c5c959a6271',
            width: 300,
            height: 300
          },
          LARGE: {
            url: 'https://edamam-product-images.s3.amazonaws.com/web-img/8a2/8a2441b65b1a639861807c4f54b5ca5a-l.jpg?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQDkilBQe1W0pqkfyy9LonBMvSgRMiXbVEz4uC9b0iN7wQIgfJ%2FmppoC5MFn4SwOPEjNRpaDlyBqkEurt2dqsl2M4kQqwQUIu%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgwxODcwMTcxNTA5ODYiDJdsT0l4shbxGX4KRiqVBcFzE0i7PTnc285aP5lsGtP4CP0Lt5eyx3hnU1lYENSqOYkRM117Tka%2FpVmOu2yrW38M5G4r03Svg1VRPEfM4QMmDTM8VclS%2FhOC7IR8WgYtDZHwyNRSIRSpH57%2B113Ky%2F1FYtQ8wzuen6NOw7Pp7%2Bc46ciaX1psXg9ovfib2xcfoUkgA4MuRe4MwXX0UfhRpz9MI5qEt7IWBVYf%2FOqxCCBlholAolhfyqz0xa0mVTQjxp%2FxgEWdvz6PLPmHMrrrVW6a9OjBU%2BaXUkslodmHL9%2B8NlSRDntC2kR9seK2ntyP9szMrBGIIaTGkDWks9F1VVoWrH2No3xm4cVvtGje6VbfQ01LiCdP1AKXTs4%2FMDxYPyi2goDX0ByFmC2x5V45Fq8vP1lHFNbR2BTewAk%2FLqtJPQRWyRQnI8WBainkiDrPud4GrrFSliLouI3pii45l3vowo0LdCCvLfyDjE30mQXQtWvNtDFZVrpI3lUsyVdU%2BuursULzqza6Z9r3B0TvUvfKYiQvdizQ%2B267gsw5tPJMdf95S18cDsfLpb6B4JdhnukjKoPqfOfvMgKa97g%2BBb9%2BaGVcJOWHF8xBnZpz7kDwe0kgGLtjN70MTe3TeXnIkXZdTf5mWtycW6%2BG01ZOTWJ3RAxeVC3Knn2dEBDjG4Ap0U3fMGqYqv6%2FAc36aelElbl8qLYH7L%2BqPBazaSNhE0wCcezLgMTgVxFTTUp8lW3cXbmiS8metD5sqCnBWbn7vuYEP3xK9TlNh3xQ59U4Ub8rlEyJixlBj5TVJYnj96%2Fm5utjLlxZInPP1pqzN3Tr1HnCJbewZO5z93JY0etwkAbYv7Ca5n18nICUJxC8i%2BjnWUYOSOkBwCR0RtfQoIjZngvnLRMw1qzUuwY6sQFqO0mj700JOA57pLoor%2FWJO2UyKemW9mc5fre2f5fWh6yyt8%2FgLf0IlQoLyPbLtdZNPzqHd6nejhx1b3ixg4eYjdo2K1tPNJxKxz1oeA8YhlNAl%2BE45IweUM0ZnO4RXtmvHt15aMuCOomUbQFfbI7swrYv%2BIw3QUImSS1WnHJCVHubBFINMUxyJtV6FCDh%2BjktlwxnOuKWbvx54AOfQLx0ZvpNBMsZsFvL%2BKws9VIUF6E%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250101T111530Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIASXCYXIIFF2SUAUH7%2F20250101%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=4114cd7180c63ac81d33e531b90df51b1facfad5356120233426d2c24daacf24',
            width: 600,
            height: 600
          }
        },
        shareAs:
          'http://www.edamam.com/recipe/peanut-butter-fudge-yum-6929610095cf45a3b55eff00864af069/yum',
        yield: 14.0,
        ingredients: [
          {
            text: null,
            quantity: 2.0,
            measure: 'cup',
            food: 'sugar',
            weight: 400.0,
            foodCategory: 'sugars',
            foodId: 'food_axi2ijobrk819yb0adceobnhm1c2',
            image:
              'https://www.edamam.com/food-img/ecb/ecb3f5aaed96d0188c21b8369be07765.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'cup',
            food: 'milk',
            weight: 244.0,
            foodCategory: 'Milk',
            foodId: 'food_b49rs1kaw0jktabzkg2vvanvvsis',
            image:
              'https://www.edamam.com/food-img/7c9/7c9962acf83654a8d98ea6a2ade93735.jpg'
          },
          {
            text: null,
            quantity: 1.5,
            measure: 'cup',
            food: 'peanut butter',
            weight: 387.0,
            foodCategory: 'plant-based protein',
            foodId: 'food_bz6b8fsbccyn3zaij72f7av8dl9m',
            image:
              'https://www.edamam.com/food-img/d74/d740276ae1409472a8714b2cee88a310.jpg'
          },
          {
            text: null,
            quantity: 2.0,
            measure: 'cup',
            food: 'marshmallow',
            weight: 100.0,
            foodCategory: 'candy',
            foodId: 'food_bkif6umbr6xns2ac1pl7vaxypd3f',
            image:
              'https://www.edamam.com/food-img/9c8/9c86a95af817e527adebbf8781aa7c4f.jpg'
          },
          {
            text: null,
            quantity: 1.0,
            measure: 'teaspoon',
            food: 'vanilla',
            weight: 4.2,
            foodCategory: 'Condiments and sauces',
            foodId: 'food_bh1wvnqaw3q7ciascfoygaabax2a',
            image:
              'https://www.edamam.com/food-img/90f/90f910b0bf82750d4f6528263e014cca.jpg'
          }
        ]
      },
      _links: {
        self: {
          href: 'https://api.edamam.com/api/recipes/v2/6929610095cf45a3b55eff00864af069?app_id=9ee15e11&app_key=a2af12a629d82717d1dcef269a4ea4f0',
          title: 'Self'
        }
      }
    }
  ]
}
