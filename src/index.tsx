import React, {
  cloneElement,
  useState,
  useReducer,
  useRef,
  useMemo,
  useEffect,
  useContext,
} from 'react'
import Button from '@accessible/button'
import {useKeycodes} from '@accessible/use-keycode'
import useConditionalFocus from '@accessible/use-conditional-focus'
import useId from '@accessible/use-id'
import useMergedRef from '@react-hook/merged-ref'
import useLayoutEffect from '@react-hook/passive-layout-effect'
import clsx from 'clsx'

const __DEV__ =
  typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'

// An optimized function for adding an `index` prop to elements of a Tab or
// Panel type. All tabs must be on the same child depth level as other tabs,
// same with panels. Once one tab or panel is found, it will not traverse
// deeper into the tree. Using this in favor of something more generalized
// in order to not hurt render performance on large trees.
const cloneChildrenWithIndex = (
  elements: React.ReactNode | React.ReactNode[],
  type: typeof Panel | typeof Tab
): React.ReactNode[] | React.ReactNode => {
  let index = 0
  let didUpdate = false
  const children = React.Children.map(elements, child => {
    // bails out if not an element object
    if (!React.isValidElement(child)) return child
    // bails out if certainly the wrong type
    if (
      (type === Panel && (child.type === TabList || child.type === Tab)) ||
      (type === Tab && child.type === Panel)
    )
      return child
    // found a match
    if (child.type === type) {
      // bail out if the indexes are user-provided
      if (child.props.index !== void 0) {
        index = child.props.index + 1
        return child
      } else {
        didUpdate = true
        return cloneElement(child, {index: index++})
      }
    }
    // only checks the children if we're not on a depth with tabs/panels
    if (index === 0) {
      const nextChildren = cloneChildrenWithIndex(child.props.children, type)
      if (nextChildren === child.props.children) return child
      else {
        didUpdate = true
        return cloneElement(child, void 0, nextChildren)
      }
    }

    return child
  })

  return !didUpdate ? elements : children.length === 1 ? children[0] : children
}

export interface TabsContextValue {
  tabs: TabState[]
  registerTab: (
    index: number,
    element: HTMLElement,
    id?: string,
    disabled?: boolean
  ) => () => void
  active: number | undefined
  activate: (index: number | undefined) => void
  manualActivation: boolean
  preventScroll: boolean
}

// @ts-ignore
export const TabsContext: React.Context<TabsContextValue> = React.createContext(
    {}
  ),
  {Consumer: TabsConsumer} = TabsContext,
  useTabs = () => useContext<TabsContextValue>(TabsContext)

export interface TabsProps {
  active?: number
  defaultActive?: number
  manualActivation?: boolean
  preventScroll?: boolean
  onChange?: (active: number | undefined) => void
  children: React.ReactNode | React.ReactNode[] | JSX.Element | JSX.Element[]
}

export type TabState =
  | {
      element?: HTMLElement
      id?: string
      disabled?: boolean
    }
  | undefined

type TabAction =
  | {
      type: 'register'
      index: number
      element: HTMLElement
      id?: string
      disabled?: boolean
    }
  | {
      type: 'unregister'
      index: number
    }

export const Tabs: React.FC<TabsProps> = ({
  active,
  defaultActive = 0,
  manualActivation = false,
  preventScroll = false,
  onChange,
  children,
}) => {
  const [tabs, dispatchTabs] = useReducer(
    (state: TabState[], action: TabAction) => {
      const {index} = action

      if (action.type === 'register') {
        state = state.slice(0)
        state[index] = {
          element: action.element,
          id: action.id,
          disabled: action.disabled,
        }
      } else if (action.type === 'unregister') {
        state = state.slice(0)
        state[index] = void 0
      }

      return state
    },
    []
  )
  const [userActive, setActive] = useState<number | undefined>(defaultActive)
  const nextActive = typeof active === 'undefined' ? userActive : active
  const prevActive = useRef<number | undefined>(nextActive)

  const context = useMemo(
    () => ({
      tabs,
      registerTab: (
        index: number,
        element: HTMLElement,
        id?: string,
        disabled?: boolean
      ) => {
        dispatchTabs({type: 'register', index, element, id, disabled})
        return () => dispatchTabs({type: 'unregister', index})
      },
      active: nextActive,
      activate: index => {
        if (tabs[index]?.disabled) return
        setActive(index)
      },
      preventScroll,
      manualActivation,
    }),
    [tabs, nextActive, manualActivation, preventScroll]
  )

  useEffect(() => {
    prevActive.current !== nextActive && onChange?.(nextActive)
    prevActive.current = nextActive
  }, [nextActive])

  return (
    <TabsContext.Provider value={context}>
      {cloneChildrenWithIndex(cloneChildrenWithIndex(children, Tab), Panel)}
    </TabsContext.Provider>
  )
}

export interface TabControls {
  activate: () => void
}

interface TabContextValue {
  id?: string
  tabRef?: HTMLElement
  index: number
  activate: () => void
  isActive: boolean
  disabled: boolean
}

// @ts-ignore
export const useTab = (index: number): TabContextValue => {
    const {tabs, activate, active} = useContext(TabsContext)
    return useMemo(
      () => ({
        id: tabs[index]?.id,
        tabRef: tabs[index]?.element,
        index: index as number,
        activate: () => !tabs[index]?.disabled && activate(index),
        isActive: index === active,
        disabled: tabs[index]?.disabled || false,
      }),
      [tabs, index, active]
    )
  },
  useIsActive = (index: number) => useTab(index).isActive,
  useDisabled = (index: number) => useTab(index).disabled,
  useControls = (index: number): TabControls => {
    const {activate} = useTab(index)
    return {activate}
  }

const noop = () => {}

export interface TabProps {
  id?: string
  index?: number
  disabled?: boolean
  activeClass?: string
  inactiveClass?: string
  activeStyle?: React.CSSProperties
  inactiveStyle?: React.CSSProperties
  onDelete?: (event: KeyboardEvent) => void
  children: React.ReactElement | JSX.Element
}

export const Tab: React.FC<TabProps> = ({
  id,
  index,
  disabled = false,
  activeClass,
  inactiveClass,
  activeStyle,
  inactiveStyle,
  onDelete = noop,
  children,
}) => {
  id = useId(id)
  const {registerTab} = useTabs()
  const triggerRef = useRef<HTMLElement>(null)
  const {tabs, manualActivation} = useTabs()
  const {isActive, activate} = useTab(index as number)
  const ref = useMergedRef(
    // @ts-ignore
    children.ref,
    triggerRef,
    useKeycodes(
      {
        // right arrow
        39: () => focusNext(tabs, index as number),
        // left arrow
        37: () => focusPrev(tabs, index as number),
        // home
        36: () => tabs[0]?.element?.focus(),
        // end
        35: () => tabs[tabs.length - 1]?.element?.focus(),
        // delete
        46: onDelete,
      },
      [activate, tabs, index, onDelete]
    )
  )

  useEffect(
    () =>
      registerTab(
        index as number,
        triggerRef.current as HTMLElement,
        id,
        disabled
      ),
    [id, disabled]
  )

  return (
    <Button>
      {cloneElement(children, {
        'aria-controls': id,
        'aria-selected': '' + isActive,
        'aria-disabled': '' + (isActive || disabled),
        role: 'tab',
        className:
          clsx(
            children.props.className,
            isActive ? activeClass : inactiveClass
          ) || void 0,
        style: Object.assign(
          {},
          children.props.style,
          isActive ? activeStyle : inactiveStyle
        ),
        tabIndex: children.props.hasOwnProperty('tabIndex')
          ? children.props.tabIndex
          : isActive
          ? 0
          : -1,
        onFocus: e => {
          !manualActivation && activate()
          children.props.onFocus?.(e)
        },
        onClick: e => {
          activate()
          children.props.onClick?.(e)
        },
        ref,
      })}
    </Button>
  )
}

const focusNext = (tabs: TabState[], currentIndex: number) => {
  if (currentIndex === tabs.length - 1) tabs[0]?.element?.focus()
  else tabs[currentIndex + 1]?.element?.focus()
}

const focusPrev = (tabs: TabState[], currentIndex: number) => {
  if (currentIndex === 0) tabs[tabs.length - 1]?.element?.focus()
  else tabs[currentIndex - 1]?.element?.focus()
}

export interface TabListProps {
  children: React.ReactElement
}

export const TabList: React.FC<TabListProps> = ({children}) =>
  cloneElement(children, {
    role: 'tablist',
  })

export interface PanelProps {
  index?: number
  activeClass?: string
  inactiveClass?: string
  activeStyle?: React.CSSProperties
  inactiveStyle?: React.CSSProperties
  children: React.ReactElement
}

export const Panel: React.FC<PanelProps> = ({
  index,
  activeClass,
  inactiveClass,
  activeStyle,
  inactiveStyle,
  children,
}) => {
  const {isActive, id} = useTab(index as number)
  const {manualActivation, preventScroll} = useTabs()
  const prevActive = useRef<boolean>(isActive)
  const ref = useMergedRef(
    // @ts-ignore
    children.ref,
    useConditionalFocus(manualActivation && !prevActive.current && isActive, {
      includeRoot: true,
      preventScroll,
    })
  )
  // ensures the tab panel won't be granted the window's focus
  // by default, but receives focus when the visual state changes to
  // active
  useLayoutEffect(() => {
    prevActive.current = isActive
  }, [isActive, index])

  return cloneElement(children, {
    'aria-hidden': `${!isActive}`,
    id,
    className:
      clsx(children.props.className, isActive ? activeClass : inactiveClass) ||
      void 0,
    style: Object.assign(
      {visibility: isActive ? 'visible' : 'hidden'},
      children.props.style,
      isActive ? activeStyle : inactiveStyle
    ),
    tabIndex: children.props.hasOwnProperty('tabIndex')
      ? children.props.tabIndex
      : isActive
      ? 0
      : -1,
    ref,
  })
}

/* istanbul ignore next */
if (__DEV__) {
  Tabs.displayName = 'Tabs'
  TabList.displayName = 'TabList'
  Tab.displayName = 'Tab'
  Panel.displayName = 'Panel'
}
