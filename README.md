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

### Props

| Prop | Type | Default | Required? | Description |
| ---- | ---- | ------- | --------- | ----------- |
|      |      |         |           |             |

## LICENSE

MIT
