import * as React from 'react'
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
export declare const TabsContext: React.Context<TabsContextValue>,
  TabsConsumer: React.Consumer<TabsContextValue>,
  useTabs: () => TabsContextValue
export interface TabsProps {
  active?: number
  defaultActive?: number
  manualActivation?: boolean
  preventScroll?: boolean
  onChange?: (active: number | undefined) => void
  children: React.ReactNode | React.ReactNode[] | JSX.Element | JSX.Element[]
}
export declare type TabState =
  | {
      element?: HTMLElement
      id?: string
      disabled?: boolean
    }
  | undefined
export declare const Tabs: React.FC<TabsProps>
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
export declare const useTab: (index: number) => TabContextValue,
  useIsActive: (index: number) => boolean,
  useDisabled: (index: number) => boolean,
  useControls: (index: number) => TabControls
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
export declare const Tab: React.FC<TabProps>
export interface TabListProps {
  children: React.ReactElement | JSX.Element
}
export declare const TabList: React.FC<TabListProps>
export interface PanelProps {
  index?: number
  activeClass?: string
  inactiveClass?: string
  activeStyle?: React.CSSProperties
  inactiveStyle?: React.CSSProperties
  children: React.ReactElement | JSX.Element
}
export declare const Panel: React.FC<PanelProps>
export {}
