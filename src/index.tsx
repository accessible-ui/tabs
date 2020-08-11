import * as React from 'react'
import {Button} from '@accessible/button'
import useKey from '@accessible/use-key'
import useConditionalFocus from '@accessible/use-conditional-focus'
import useId from '@accessible/use-id'
import useMergedRef from '@react-hook/merged-ref'
import useLayoutEffect from '@react-hook/passive-layout-effect'
import useChange from '@react-hook/change'
import clsx from 'clsx'

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
  const children = React.Children.map(elements, (child) => {
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
        return React.cloneElement(child, {index: index++})
      }
    }
    // only checks the children if we're not on a depth with tabs/panels
    if (index === 0) {
      const nextChildren = cloneChildrenWithIndex(child.props.children, type)
      if (nextChildren === child.props.children) return child
      else {
        didUpdate = true
        return React.cloneElement(child, void 0, nextChildren)
      }
    }

    return child
  })

  return !didUpdate ? elements : children?.length === 1 ? children[0] : children
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

const noop = () => {}

export const TabsContext = React.createContext<TabsContextValue>({
    tabs: [],
    registerTab: () => noop,
    active: void 0,
    activate: noop,
    manualActivation: false,
    preventScroll: false,
  }),
  {Consumer: TabsConsumer} = TabsContext,
  useTabs = () => React.useContext<TabsContextValue>(TabsContext)

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
  onChange = noop,
  children,
}) => {
  const [tabs, dispatchTabs] = React.useReducer(
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
  const [userActive, setActive] = React.useState<number | undefined>(
    defaultActive
  )
  useChange(userActive, onChange)
  const nextActive = active ?? userActive

  const context = React.useMemo<TabsContextValue>(
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
      activate: (index) => {
        if (tabs[index || -1]?.disabled) return
        setActive(index)
      },
      preventScroll,
      manualActivation,
    }),
    [tabs, nextActive, manualActivation, preventScroll]
  )

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

export const useTab = (index: number): TabContextValue => {
    const {tabs, activate, active} = React.useContext(TabsContext)
    return React.useMemo(
      () => ({
        id: tabs[index]?.id,
        tabRef: tabs[index]?.element,
        index: index as number,
        activate: () => !tabs[index]?.disabled && activate(index),
        isActive: index === active,
        disabled: tabs[index]?.disabled || false,
      }),
      [tabs, index, active, activate]
    )
  },
  useIsActive = (index: number) => useTab(index).isActive,
  useDisabled = (index: number) => useTab(index).disabled,
  useControls = (index: number): TabControls => {
    const {activate} = useTab(index)
    return {activate}
  }

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
  const triggerRef = React.useRef<HTMLElement>(null)
  const {tabs, manualActivation} = useTabs()
  const {isActive, activate} = useTab(index as number)
  const ref = useMergedRef(
    // @ts-ignore
    children.ref,
    triggerRef
  )

  useKey(triggerRef, {
    // right arrow
    ArrowRight: () => focusNext(tabs, index as number),
    // left arrow
    ArrowLeft: () => focusPrev(tabs, index as number),
    // home
    Home: () => tabs[0]?.element?.focus(),
    // end
    End: () => tabs[tabs.length - 1]?.element?.focus(),
    // delete
    Delete: onDelete,
  })

  React.useEffect(
    () =>
      registerTab(
        index as number,
        triggerRef.current as HTMLElement,
        id,
        disabled
      ),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, disabled, index]
  )

  return (
    <Button>
      {React.cloneElement(children, {
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
        onFocus: (e: React.MouseEvent<HTMLElement>) => {
          if (!manualActivation) activate()
          children.props.onFocus?.(e)
        },
        onClick: (e: React.MouseEvent<HTMLElement>) => {
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
  children: React.ReactElement | JSX.Element
}

export const TabList: React.FC<TabListProps> = ({children}) =>
  React.cloneElement(children, {
    role: 'tablist',
  })

export interface PanelProps {
  index?: number
  activeClass?: string
  inactiveClass?: string
  activeStyle?: React.CSSProperties
  inactiveStyle?: React.CSSProperties
  children: React.ReactElement | JSX.Element
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
  const prevActive = React.useRef<boolean>(isActive)
  const panelRef = React.useRef<HTMLElement>(null)
  const ref = useMergedRef(
    // @ts-ignore
    children.ref,
    panelRef
  )

  useConditionalFocus(
    panelRef,
    manualActivation && !prevActive.current && isActive,
    {
      includeRoot: true,
      preventScroll,
    }
  )

  // ensures the tab panel won't be granted the window's focus
  // by default, but receives focus when the visual state changes to
  // active
  useLayoutEffect(() => {
    prevActive.current = isActive
  }, [isActive, index])

  return React.cloneElement(children, {
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
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  Tabs.displayName = 'Tabs'
  TabList.displayName = 'TabList'
  Tab.displayName = 'Tab'
  Panel.displayName = 'Panel'
}
