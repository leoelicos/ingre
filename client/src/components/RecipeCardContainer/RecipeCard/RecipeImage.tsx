import { Image } from 'antd'
import React, { FC } from 'react'

const RecipeImage: FC<{
  name: string | undefined
  picture_url: string | undefined
}> = ({ name, picture_url }) => (
  <Image
    width={'100%'}
    height={150}
    style={{
      objectFit: 'cover',
      borderTopLeftRadius: '1rem',
      borderTopRightRadius: '1rem'
    }}
    alt={name || 'recipe image'}
    src={
      picture_url ||
      'https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc'
    }
    placeholder={true}
    fallback="https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc"
  />
)

export default RecipeImage
