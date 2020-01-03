<hr>
<div align="center">
  <h1 align="center">
    &lt;Tabs&gt;
  </h1>
</div>

<p align="center">
  <a href="https://bundlephobia.com/result?p=@accessible/tabs">
    <img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/@accessible/tabs?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Types" href="https://www.npmjs.com/package/@accessible/tabs">
    <img alt="Types" src="https://img.shields.io/npm/types/@accessible/tabs?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Code coverage report" href="https://codecov.io/gh/accessible-ui/tabs">
    <img alt="Code coverage" src="https://img.shields.io/codecov/c/gh/accessible-ui/tabs?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Build status" href="https://travis-ci.org/accessible-ui/tabs">
    <img alt="Build status" src="https://img.shields.io/travis/accessible-ui/tabs?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@accessible/tabs">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/@accessible/tabs?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="License" href="https://jaredlunde.mit-license.org/">
    <img alt="MIT License" src="https://img.shields.io/npm/l/@accessible/tabs?style=for-the-badge&labelColor=24292e">
  </a>
</p>

<pre align="center">npm i @accessible/tabs</pre>
<hr>

An accessible and versatile tabs component for React modeled after
the [WAI-ARIA example taught here](https://www.w3.org/TR/wai-aria-practices/examples/tabs/tabs-1/tabs.html).

## Quick Start

[Check out the example on CodeSandbox](https://codesandbox.io/s/accessibletabs-example-0dw15)

```jsx harmony
import {Tabs, TabList, Tab, Panel} from '@accessible/tabs'

const Component = () => (
  <Tabs defaultActive={0} manualActivation>
    <TabList>
      <div aria-label="Some research thing">
        <Tab>
          <button>Abstract</button>
        </Tab>
        <Tab>
          <button>References</button>
        </Tab>
      </div>
    </TabList>

    <Panel>
      <div>Abstract body</div>
    </Panel>
    <Panel>
      <div>References body</div>
    </Panel>
  </Tabs>
)
```

## API

### Components

| Component               | Description                                                                                                                                                                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`<Tabs>`](#tabs)       | This component creates the context for your tabs and contains some configuration options. You'll need to add [`<Tab>`](#tab) and [`<Panel>`](#panel) as children in order to actually create tabs.                                                                                        |
| [`<TabList>`](#tablist) | The component adds `role='tablist'` to its child component.                                                                                                                                                                                                                               |
| [`<Tab>`](#tab)         | This component clones any React element and turns it into a tab that controls the visible state of a [`<Panel>`](#panel). It must be a child of [`<Tabs>`](#tabs) and all tabs must be adjacent in the tree. Each tab has a corresponding [`<Panel>`](#panel) that shares the same index. |
| [`<Panel>`](#panel)     | This component clones its child and turns it into a panel that corresponds to a [`<Tab>`](#tab) with the same index. All panels must be adjacent in the tree unless an `index` prop is defined.                                                                                           |

### Hooks

| Hook                                        | Description                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| [`useTabs()`](#usetabs)                     | This hook returns the value of the [TabsContext object](#tabscontextvalue). |
| [`useTab()`](#usetabindex-number)           | This hook returns the value of the [TabContext object](#tabcontextvalue).   |
| [`useControls()`](#usecontrolsindex-number) | This hook returns a [`<Tab>`'s](#tab) `activate` function.                  |
| [`useDisabled()`](#usedisabledindex-number) | This hook returns a [`<Tab>`'s](#tab) `disabled` value.                     |
| [`useIsActive()`](#useisactiveindex-number) | This hook returns a [`<Tab>`'s](#tab) `isActive` value.                     |

### `<Tabs>`

This component creates the context for your tabs and contains some configuration options. You'll need to add
[`<Tab>`](#tab) and [`<Panel>`](#panel) as children in order to actually create tabs.

#### Props

| Prop             | Type                       | Default     | Required? | Description                                                                                                                                                                                                                             |
| ---------------- | -------------------------- | ----------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| defaultActive    | `number`                   | `0`         | No        | The [`<Tab>`](#tab) index you want active by default.                                                                                                                                                                                   |
| active           | `number`                   | `undefined` | No        | Makes this a controlled component where the `activate` control has no effect. The tab index defined here is always the one that is active.                                                                                              |
| manualActivation | `boolean`                  | `false`     | No        | By default this component opens tabs automatically when using keyboard navigation to switch between tabs. By setting this to `true`, the user will have to use the `space` or `enter` key to activate the tab after the tab is focused. |
| onChange         | `(active: number) => void` | `undefined` | No        | Called each time the active tab changes. It provides the active tab `index` as its only argument.                                                                                                                                       |
| children         | `React.ReactNode[]`        | `undefined` | Yes       | You can define any children here with some caveats listed elsewhere.                                                                                                                                                                    |

### `<TabList>`

#### Props

| Prop     | Type                 | Default     | Required? | Description                                                                      |
| -------- | -------------------- | ----------- | --------- | -------------------------------------------------------------------------------- |
| children | `React.ReactElement` | `undefined` | Yes       | The child is cloned by this component and given a property for `role='tablist'`. |

### `<Tab>`

This component clones any React element and turns it into a tab that controls the visible state of a [`<Panel>`](#panel). It must be a child of [`<Tabs>`](#tabs) and all
tabs must be adjacent in the tree. Each tab has a corresponding [`<Panel>`](#panel) that shares the same index.

```jsx harmony
// YES
const MyTabs = () => (
  <Tabs>
    <TabList>
      {/* index: 0 */}
      <Tab>
        <div />
      </Tab>
      {/* index: 1 */}
      <Tab>
        <div />
      </Tab>
    </TabList>
    {/* index: 0 */}
    <Panel>
      <div />
    </Panel>
    {/* index: 1 */}
    <Panel>
      <div />
    </Panel>
  </Tabs>
)

// ABSOLUTELY NOT
const MyTabs = () => (
  <Tabs>
    <TabList>
      {/* The Tab components here are not adjacent in the tree. */}
      <div>
        <Tab>
          <div />
        </Tab>
      </div>
      <div>
        <Tab>
          <div />
        </Tab>
      </div>
    </TabList>
    <Panel>
      <div />
    </Panel>
    <Panel>
      <div />
    </Panel>
  </Tabs>
)
```

#### Props

| Prop          | Type                             | Default     | Required? | Description                                                                                                                                                                                                                                                   |
| ------------- | -------------------------------- | ----------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| activeClass   | `string`                         | `undefined` | No        | Adds this class to the child component when the tab is in an active state.                                                                                                                                                                                    |
| inactiveClass | `string`                         | `undefined` | No        | Adds this class to the child component when the tab is in an inactive state.                                                                                                                                                                                  |
| activeStyle   | `React.CSSProperties`            | `undefined` | No        | Adds these styles to the child component when the tab is in an active state.                                                                                                                                                                                  |
| inactiveStyle | `React.CSSProperties`            | `undefined` | No        | Adds these styles to the child component when the tab is in an inactive state.                                                                                                                                                                                |
| id            | `string`                         | `undefined` | No        | Defining an ID here overrides the auto id generated for aria attributes.                                                                                                                                                                                      |
| disabled      | `boolean`                        | `false`     | No        | Setting this to `true` will prevent the tab from activating if it isn't already active.                                                                                                                                                                       |
| index         | `number`                         | `undefined` | No        | Setting an index here overrides the default index created when this component mounts. Indexes are used to match tabs to their corresponding [`<Panel>`](#panel). I would recommend not setting this property and letting the library handle it automatically. |
| onDelete      | `(event: KeyboardEvent) => void` | `undefined` | No        | This callback will fire if a user presses the `Delete` key on their keyboard when this tab (not the panel) is focused.                                                                                                                                        |
| children      | `React.ReactElement`             | `undefined` | Yes       | The child is cloned by this component and has aria attributes injected into its props as well as keyboard event handlers for navigating between tabs.                                                                                                         |

### `<Panel>`

This component clones its child and turns it into a panel that corresponds to a [`<Tab>`](#tab) with the same
index. All panels must be adjacent in the tree unless an `index` prop is defined. For example:

```
<Tabs>
  <TabList>
    [0] <Tab>
    [1] <Tab>
  </TabList>

  [0] <Panel>
  [1] <Panel>
</Tabs>
```

#### Props

| Prop          | Type                  | Default     | Required? | Description                                                                                                                                                                                                                                                 |
| ------------- | --------------------- | ----------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| activeClass   | `string`              | `undefined` | No        | Adds this class to the child component when the panel's [`<Tab>`](#tab) is in an active state.                                                                                                                                                              |
| inactiveClass | `string`              | `undefined` | No        | Adds this class to the child component when the panel's [`<Tab>`](#tab) is in an inactive state.                                                                                                                                                            |
| activeStyle   | `React.CSSProperties` | `undefined` | No        | Adds these styles to the child component when the panel's [`<Tab>`](#tab) is in an active state.                                                                                                                                                            |
| inactiveStyle | `React.CSSProperties` | `undefined` | No        | Adds these styles to the child component when the panel's [`<Tab>`](#tab) is in an inactive state.                                                                                                                                                          |
| index         | `number`              | `undefined` | No        | Setting an index here overrides the default index created when this component mounts. Indexes are used to match panels to their corresponding [`<Tab>`](#tab). I would recommend not setting this property and letting the library handle it automatically. |
| children      | `React.ReactElement`  | `undefined` | Yes       | The child is cloned by this component and has aria attributes injected into its props and will have its visible state controlled by the [`<Tab>`](#tab) component with the same index.                                                                      |

### `useTab(index: number)`

Returns [`TabContext object`](#tabcontextvalue) for the [`<Tab>`](#tab) corresponding to the provided `index`.
It must be used within a child of [`<Tabs>`](#tabs).

### `TabContextValue`

```typescript
interface TabContextValue {
  // The ID used for aria attributes
  id?: string
  // A ref to the tab's underlying element
  tabRef?: HTMLElement
  // The index of the tab
  index: number
  // Activates this tab unless `disabled` is `true`
  activate: () => void
  // Is this tab active?
  isActive: boolean
  // Is this tab disabled?
  disabled: boolean
}
```

### `useIsActive(index: number)`

Returns `true` if the [`<Tab>`](#tab) at the provided `index` is currently active. It must be used within a child
of [`<Tabs>`](#tabs).

### `useDisabled(index: number)`

Returns `true` if the [`<Tab>`](#tab) at the provided `index` is currently disabled. It must be used within a child
of [`<Tabs>`](#tabs).

### `useControls(index: number)`

Returns the `activate` control for the [`<Tab>`](#tab) at the provided `index`. It must be used within a child
of [`<Tabs>`](#tabs).

### `useTabs()`

This hook returns the value of the [TabsContext object](#tabscontextvalue). This hook must be within a child of [`<Tabs>`](#tabs).

### `TabsContextValue`

```typescript
interface TabsContextValue {
  // An array of tabs that have been registered
  tabs: TabState[]
  // Registers a new tab
  registerTab: (
    index: number,
    element: HTMLElement,
    id?: string,
    disabled?: boolean
  ) => () => void
  // The tab that is currently active
  active: number | undefined
  // Activates the tab at `index`
  activate: (index: number | undefined) => void
  // Is manual activation configured?
  manualActivation: boolean
}

type TabState =
  | {
      element?: HTMLElement
      id?: string
      disabled?: boolean
    }
  | undefined
```

## LICENSE

MIT
