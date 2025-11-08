'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { Mode, SystemMode } from '@core/types'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Navigation Imports
import getNavigation from '@/navigation/vertical'


type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
  mode?: Mode
  systemMode?: SystemMode
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar
  const menuItems = getNavigation()

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.visible) return true

    try {
      return item.visible()
    } catch (error) {
      console.error('Menu visibility check failed:', error)

return false
    }
  })

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {filteredMenuItems.map(item =>
          item.children ? (
            <SubMenu key={item.path} label={item.title} icon={<i className={item.icon} />}>
              {item.children
                .filter(child => {
                  if (!child.visible) return true

                  try {
                    return child.visible()
                  } catch (error) {
                    console.error('Submenu visibility check failed:', error)

return false
                  }
                })
                .map(child => (
                  <MenuItem
                    key={child.path}
                    href={child.path}
                  >
                    {child.title}
                  </MenuItem>
                ))}
            </SubMenu>
          ) : (
            <MenuItem
              key={item.path}
              href={item.path}
              icon={<i className={item.icon} />}
            >
              {item.title}
            </MenuItem>
          )
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
