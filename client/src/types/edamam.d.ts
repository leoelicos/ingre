export interface SearchParams {
  q?: string
  diet?: string[]
  health?: string[]
  cuisineType?: string[]
  mealType?: string[]
  dishType?: string[]
}

export interface FetchEdamamOptions {
  search: SearchParams
  appId: string
  appKey: string
}

/* 

        'field=uri',
        'field=label',
        'field=image',
        'field=images',
        'field=yield',
        'field=ingredients',
        'field=shareAs',
        
        */
export interface EdamamHit {
  recipe: {
    uri?: string
    label?: string
    image?: string
    images?: {
      THUMBNAIL?: {
        url?: string
        width?: number
        height?: number
      }
      SMALL?: {
        url?: string
        width?: number
        height?: number
      }
      REGULAR?: {
        url?: string
        width?: number
        height?: number
      }
      LARGE?: {
        url?: string
        width?: number
        height?: number
      }
    }
    shareAs?: string
    yield?: number
    ingredients: Array<{
      text?: string | null
      quantity?: number | null
      measure?: string | null
      food?: string | null
      weight?: number | null
      foodId?: string | null
      foodCategory?: string | null
    }>
  }
  _links?: {
    self?: {
      href?: string
      title?: string
    }
    next?: {
      href?: string
      title?: string
    }
  }
}

export interface EdamamRecipeSearchResponse {
  from: number
  to: number
  count: number
  _links: {
    self: {
      href: string
      title: string
    }
    next: {
      href: string
      title: string
    }
  }
  hits: EdamamHit[]
}
