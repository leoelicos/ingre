import React, { FC } from 'react'
import { Divider, Spin } from 'antd'

const RecipeCardContainerLoading: FC = () => {
  return (
    <Divider>
      <Spin tip="Loading saved recipes…" />
    </Divider>
  )
}
export default RecipeCardContainerLoading
