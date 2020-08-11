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
export declare function Tabs({
  active,
  defaultActive,
  manualActivation,
  preventScroll,
  onChange,
  children,
}: TabsProps): JSX.Element
export declare namespace Tabs {
  var displayName: string
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
export declare function useTab(index: number): TabContextValue
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
export declare function Tab({
  id,
  index,
  disabled,
  activeClass,
  inactiveClass,
  activeStyle,
  inactiveStyle,
  onDelete,
  children,
}: TabProps): JSX.Element
export declare namespace Tab {
  var displayName: string
}
export interface TabListProps {
  children: React.ReactElement | JSX.Element
}
export declare function TabList({
  children,
}: TabListProps): React.ReactElement<
  any,
  | string
  | ((
      props: any
    ) => React.ReactElement<
      any,
      string | any | (new (props: any) => React.Component<any, any, any>)
    > | null)
  | (new (props: any) => React.Component<any, any, any>)
>
export declare namespace TabList {
  var displayName: string
}
export interface PanelProps {
  index?: number
  activeClass?: string
  inactiveClass?: string
  activeStyle?: React.CSSProperties
  inactiveStyle?: React.CSSProperties
  children: React.ReactElement | JSX.Element
}
export declare function Panel({
  index,
  activeClass,
  inactiveClass,
  activeStyle,
  inactiveStyle,
  children,
}: PanelProps): React.ReactElement<
  any,
  | string
  | ((
      props: any
    ) => React.ReactElement<
      any,
      string | any | (new (props: any) => React.Component<any, any, any>)
    > | null)
  | (new (props: any) => React.Component<any, any, any>)
>
export declare namespace Panel {
  var displayName: string
}
export {}
