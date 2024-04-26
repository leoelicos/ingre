import React, { FC } from 'react'
import { IngreIconLogoEgg } from '../../../../lib/icon/Icon.tsx'
import LogoText from './LogoText.tsx'
import LogoWrapper from './LogoWrapper.tsx'

const Logo: FC = () => {
  return (
    <LogoWrapper>
      <IngreIconLogoEgg />
      <LogoText>ingré</LogoText>
    </LogoWrapper>
  )
}
export default Logo
