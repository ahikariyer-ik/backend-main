'use client'

// Component Imports
import AhiLogo from '@assets/svg/Logo'

import MiniLogo from '@assets/svg/LogoMini'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'


const Logo = () => {

  // Hooks
  const { isHovered, isCollapsed } = useVerticalNav()
  const { settings } = useSettings()

  return (
    <div className='flex items-center'>
      {
        isCollapsed && !isHovered ? (
          <MiniLogo className='text-2xl text-primary' width={40} height={40} fill={settings.mode === "dark" ? "#FFFFFF" : "#000000"} />
        ) :
        <AhiLogo className='text-2xl text-primary' width={140} height={40} fill={settings.mode === "dark" ? "#FFFFFF" : "#000000"} />
      }

    </div>
  )
}

export default Logo
