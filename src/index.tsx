import React, {
  cloneElement,
  useState,
  useRef,
  useMemo,
  useEffect,
  useContext,
} from 'react'
import {useKeycodes} from '@accessible/use-keycode'
import useConditionalFocus from '@accessible/use-conditional-focus'
import useMergedRef from '@react-hook/merged-ref'
import useLayoutEffect from '@react-hook/passive-layout-effect'
import useId from '@accessible/use-id'
import clsx from 'clsx'

const __DEV__ =
  typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'

const replaceChildren1d = (
  Element: React.ReactElement | JSX.Element,
  cloneProps:
    | Record<string, any>
    | ((current: Record<string, any>) => Record<string, any>),
  match: (child: React.ReactElement) => boolean
): boolean => {
  if (!React.isValidElement(Element)) return false
  const found: React.ReactElement[] = []

  React.Children.forEach(Element.props.children, (child, index) => {
    if (React.isValidElement(child)) {
      if (match(child))
        found.push(
          cloneElement(
            child,
            Object.assign(
              {key: index},
              typeof cloneProps === 'function'
                ? cloneProps(child.props as Record<string, any>)
                : cloneProps
            )
          )
        )
      else if (found.length === 0)
        replaceChildren1d(
          (child.props as Record<string, any>).children,
          cloneProps,
          match
        )
    }
  })

  cloneElement(Element, void 0, found)
  return found.length > 0
}

export interface TabsContextValue {
  tabs: (HTMLElement | undefined)[]
  registerTab: (index: number, trigger: HTMLElement) => () => void
  panels: (HTMLElement | undefined)[]
  registerPanel: (index: number, panel: HTMLElement) => () => void
  active: number | undefined
  activate: (tab: number | undefined) => void
  isActive: (tab: number | undefined) => boolean
  manualActivation: boolean
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
  onChange?: (active: number | undefined) => void
  children:
    | React.ReactElement
    | React.ReactElement[]
    | JSX.Element
    | JSX.Element[]
}

export const Tabs: React.FC<TabsProps> = ({
  active,
  defaultActive = 0,
  manualActivation = false,
  onChange,
  children,
}) => {
  const [tabs, setTabs] = useState<(HTMLElement | undefined)[]>([])
  const [userActive, setActive] = useState<number | undefined>(defaultActive)
  const nextActive = typeof active === 'undefined' ? userActive : active

  if (__DEV__) {
    if (nextActive === void 0) {
      throw new Error(
        `Tabs requires at least one tab to be open, but there were no active tabs. ` +
          `Try setting a \`defaultActive\` property.`
      )
    }
  }

  const context = useMemo(
    () => ({
      tabs,
      registerTab: (index: number, trigger: HTMLElement) => {
        setTabs(current => {
          const next = current.slice(0)
          next[index] = trigger
          return next
        })

        return () =>
          setTabs(current => {
            if (current[index] === void 0) return current
            const next = current.slice(0)
            next[index] = void 0
            return next
          })
      },
      panels: [],
      registerPanel: () => () => {},
      active: nextActive,
      activate: (index: number | undefined) => setActive(index),
      isActive: (index: number | undefined) =>
        index !== void 0 && nextActive === index,
      manualActivation,
    }),
    [tabs, nextActive, manualActivation]
  )

  useEffect(() => {
    onChange?.(nextActive)
  }, [nextActive])

  return (
    <TabsContext.Provider value={context}>
      {React.Children.map(children, (child_, index) => {
        const child = child_ as React.ReactElement
        const {index: childIndex} = child.props

        return cloneElement(child, {
          key: child.key === null ? index : child.key,
          index: childIndex !== void 0 ? childIndex : index,
        })
      })}
    </TabsContext.Provider>
  )
}

export interface TabContextValue {
  isOpen: boolean
  open: () => void
  id?: string
  index: number
  triggerRef: React.MutableRefObject<HTMLElement | null>
}

export interface TabControls {
  open: () => void
}

// @ts-ignore
export const TabContext: React.Context<TabContextValue> = React.createContext(
    {}
  ),
  {Consumer: TabConsumer} = TabContext,
  useTab = () => useContext<TabContextValue>(TabContext),
  useIsOpen = () => useTab().isOpen,
  useControls = (): TabControls => {
    const {open} = useTab()
    return {open}
  }

export interface TabProps {
  id?: string
  index?: number
  openClass?: string
  closedClass?: string
  openStyle?: React.CSSProperties
  closedStyle?: React.CSSProperties
  children:
    | React.ReactNode
    | React.ReactNode[]
    | JSX.Element[]
    | JSX.Element
    | ((context: TabContextValue) => React.ReactNode)
}

export const Tab: React.FC<TabProps> = ({
  id,
  index,
  openClass,
  closedClass,
  openStyle,
  closedStyle,
  children,
}) => {
  const {isActive, activate, registerTab} = useTabs()
  const triggerRef = useRef<HTMLElement>(null)
  id = useId(id)

  useEffect(
    () => registerTab(index as number, triggerRef.current as HTMLElement),
    []
  )

  const context = useMemo(
    () => ({
      id,
      index: index as number,
      open: () => activate(index),
      isOpen: isActive(index),
      triggerRef,
    }),
    [id, index, activate, isActive]
  )

  // @ts-ignore
  children = typeof children === 'function' ? children(context) : children

  return (
    <TabContext.Provider
      value={context}
      children={
        <Trigger
          openClass={openClass}
          closedClass={closedClass}
          openStyle={openStyle}
          closedStyle={closedStyle}
        >
          {/* ts-ignore*/}
          {children}
        </Trigger>
      }
    />
  )
}

/*export */ interface TriggerProps {
  openClass?: string
  closedClass?: string
  openStyle?: React.CSSProperties
  closedStyle?: React.CSSProperties
  children: any
}

/*export */ const Trigger: React.FC<TriggerProps> = ({
  openClass,
  closedClass,
  openStyle,
  closedStyle,
  children,
}) => {
  const {tabs, isActive} = useTabs()
  const {isOpen, id, index, open, triggerRef} = useTab()
  const ref = useMergedRef(
    // @ts-ignore
    children.ref,
    triggerRef,
    useKeycodes({
      // space bar
      32: open,
      // enter
      13: open,
      // right arrow
      38: () => focusNext(tabs, index),
      // left arrow
      37: () => focusPrev(tabs, index),
      // home
      36: () => tabs[0]?.focus(),
      // end
      35: () => tabs[tabs.length - 1]?.focus(),
    })
  )

  return cloneElement(children, {
    'aria-controls': id,
    'aria-selected': String(isOpen),
    'aria-disabled': String(isOpen && isActive(index)),
    className:
      clsx(children.props.className, isOpen ? openClass : closedClass) ||
      void 0,
    style: Object.assign(
      {},
      children.props.style,
      isOpen ? openStyle : closedStyle
    ),
    tabIndex:
      children.props.tabIndex !== void 0
        ? children.props.tabIndex
        : isOpen
        ? 0
        : -1,
    onClick: e => {
      open()
      children.props.onClick?.(e)
    },
    ref,
  })
}

export const focusNext = (
  tabs: (HTMLElement | undefined)[],
  currentIndex: number
) => {
  if (currentIndex === tabs.length - 1) tabs[0]?.focus()
  else tabs[currentIndex + 1]?.focus()
}

export const focusPrev = (
  tabs: (HTMLElement | undefined)[],
  currentIndex: number
) => {
  if (currentIndex === 0) tabs[tabs.length - 1]?.focus()
  else tabs[currentIndex - 1]?.focus()
}

export interface PanelProps {
  openClass?: string
  closedClass?: string
  openStyle?: React.CSSProperties
  closedStyle?: React.CSSProperties
  children: React.ReactElement
}

export const Panel: React.FC<PanelProps> = ({
  openClass,
  closedClass,
  openStyle,
  closedStyle,
  children,
}) => {
  const {id, isOpen} = useTab()
  // handles closing the modal when the ESC key is pressed
  const prevOpen = useRef<boolean>(isOpen)
  const focusRef = useConditionalFocus(!prevOpen.current && isOpen, true)
  const ref = useMergedRef(
    // @ts-ignore
    children.ref,
    focusRef
  )
  // ensures the accordion content won't be granted the window's focus
  // by default
  useLayoutEffect(() => {
    prevOpen.current = isOpen
  }, [isOpen])

  return cloneElement(children, {
    'aria-hidden': `${!isOpen}`,
    id,
    className:
      clsx(children.props.className, isOpen ? openClass : closedClass) ||
      void 0,
    style: Object.assign(
      {visibility: isOpen ? 'visible' : 'hidden'},
      children.props.style,
      isOpen ? openStyle : closedStyle
    ),
    tabIndex: children.props.tabIndex !== void 0 ? children.props.tabIndex : 0,
    ref,
  })
}

/* istanbul ignore next */
if (__DEV__) {
  Tabs.displayName = 'Tabs'
  Tab.displayName = 'Tab'
  Panel.displayName = 'Panel'
  Trigger.displayName = 'Trigger'
}
