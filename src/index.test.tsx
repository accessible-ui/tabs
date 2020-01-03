/* jest */
import React from 'react'
import {renderHook} from '@testing-library/react-hooks'
import {render, fireEvent} from '@testing-library/react'
import {Tabs, Tab, Panel, TabList, useControls} from './index'

const click_ = fireEvent.click
fireEvent.click = (...args) => {
  fireEvent.mouseDown(...args)
  return click_(...args)
}

describe('<Tabs>', () => {
  it('should render child tabs and panels', () => {
    expect(
      render(
        <Tabs>
          <Tab>
            <div />
          </Tab>
          <Panel>
            <div />
          </Panel>
          some string
        </Tabs>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('should render child tabs and panels even when nested', () => {
    expect(
      render(
        <Tabs>
          <div>
            <div>
              <Tab>
                <div />
              </Tab>
              <Tab>
                <div />
              </Tab>
            </div>
          </div>
          <div>
            <Panel>
              <div />
            </Panel>
            <Panel>
              <div />
            </Panel>
          </div>
        </Tabs>
      ).asFragment()
    ).toMatchSnapshot()
  })

  it('should use defaultActive', () => {
    expect(
      render(
        <Tabs defaultActive={1}>
          <Tab>
            <div />
          </Tab>
          <Tab>
            <div />
          </Tab>
          <Panel>
            <div />
          </Panel>
          <Panel>
            <div />
          </Panel>
        </Tabs>
      ).asFragment()
    ).toMatchSnapshot('0=inactive, 1=active')
  })

  it('should respond to active prop', () => {
    const {asFragment, rerender} = render(
      <Tabs active={0}>
        <Tab>
          <div />
        </Tab>
        <Tab>
          <div />
        </Tab>
        <Panel>
          <div />
        </Panel>
        <Panel>
          <div />
        </Panel>
      </Tabs>
    )

    expect(asFragment()).toMatchSnapshot('0=active, 1=inactive')

    rerender(
      <Tabs active={1}>
        <Tab>
          <div />
        </Tab>
        <Tab>
          <div />
        </Tab>
        <Panel>
          <div />
        </Panel>
        <Panel>
          <div />
        </Panel>
      </Tabs>
    )

    expect(asFragment()).toMatchSnapshot('0=inactive, 1=active')
  })

  it('should fire onChange when active tab changes', () => {
    const cb = jest.fn()
    const {rerender} = render(
      <Tabs active={0} onChange={cb}>
        <Tab>
          <div />
        </Tab>
        <Tab>
          <div />
        </Tab>
        <Panel>
          <div />
        </Panel>
        <Panel>
          <div />
        </Panel>
      </Tabs>
    )

    expect(cb).not.toBeCalled()

    rerender(
      <Tabs active={1} onChange={cb}>
        <Tab>
          <div />
        </Tab>
        <Tab>
          <div />
        </Tab>
        <Panel>
          <div />
        </Panel>
        <Panel>
          <div />
        </Panel>
      </Tabs>
    )

    expect(cb).toBeCalledWith(1)
  })

  it('should work with user-defined indexes', () => {
    expect(
      render(
        <Tabs defaultActive={1}>
          <Tab index={1}>
            <div data-index={1} />
          </Tab>
          <Tab index={0}>
            <div data-index={0} />
          </Tab>
          <Panel index={0}>
            <div data-index={0} />
          </Panel>
          <Panel index={1}>
            <div data-index={1} />
          </Panel>
        </Tabs>
      ).asFragment()
    ).toMatchSnapshot('0=inactive, 1=active')
  })
})

describe('<Tab>', () => {
  it('should activate on click', () => {
    const {getByTestId} = render(
      <Tabs>
        <Tab>
          <div />
        </Tab>
        <Tab>
          <div data-testid="btn" />
        </Tab>
      </Tabs>
    )

    expect(getByTestId('btn').getAttribute('aria-selected')).toBe('false')
    fireEvent.click(getByTestId('btn'))
    expect(getByTestId('btn').getAttribute('aria-selected')).toBe('true')
  })

  it('should not activate if disabled', () => {
    const {getByTestId} = render(
      <Tabs>
        <Tab>
          <div />
        </Tab>
        <Tab disabled>
          <div data-testid="btn" />
        </Tab>
      </Tabs>
    )

    expect(getByTestId('btn').getAttribute('aria-disabled')).toBe('true')
    expect(getByTestId('btn').getAttribute('aria-selected')).toBe('false')
    fireEvent.click(getByTestId('btn'))
    expect(getByTestId('btn').getAttribute('aria-disabled')).toBe('true')
    expect(getByTestId('btn').getAttribute('aria-selected')).toBe('false')
  })

  it('should apply activeClass/inactiveClass', () => {
    const {getByTestId} = render(
      <Tabs>
        <Tab activeClass="active">
          <div data-testid="btn1" className="tab" />
        </Tab>
        <Tab inactiveClass="inactive">
          <div data-testid="btn2" className="tab" />
        </Tab>
      </Tabs>
    )

    expect(getByTestId('btn1').getAttribute('class')).toBe('tab active')
    expect(getByTestId('btn2').getAttribute('class')).toBe('tab inactive')
  })

  it('should apply activeStyle/inactiveStyle', () => {
    const {getByTestId} = render(
      <Tabs>
        <Tab activeStyle={{display: 'block'}}>
          <div data-testid="btn1" style={{opacity: 0.5}} />
        </Tab>
        <Tab inactiveStyle={{display: 'none'}}>
          <div data-testid="btn2" style={{opacity: 0.5}} />
        </Tab>
      </Tabs>
    )

    expect(getByTestId('btn1').getAttribute('style')).toEqual(
      'opacity: 0.5; display: block;'
    )
    expect(getByTestId('btn2').getAttribute('style')).toEqual(
      'opacity: 0.5; display: none;'
    )
  })

  it('should allow user-defined tabIndex', () => {
    const {getByTestId} = render(
      <Tabs>
        <Tab>
          <div tabIndex={2} data-testid="btn" />
        </Tab>
      </Tabs>
    )

    expect(getByTestId('btn').getAttribute('tabindex')).toEqual('2')
  })

  it('should fire user-defined onFocus', () => {
    const cb = jest.fn()

    const {getByTestId} = render(
      <Tabs>
        <Tab>
          <div onFocus={cb} data-testid="btn" />
        </Tab>
      </Tabs>
    )

    expect(cb).not.toBeCalled()
    fireEvent.focus(getByTestId('btn'))
    expect(cb).toBeCalled()
  })

  it('should fire user-defined onClick', () => {
    const cb = jest.fn()

    const {getByTestId} = render(
      <Tabs>
        <Tab>
          <div onClick={cb} data-testid="btn" />
        </Tab>
      </Tabs>
    )

    expect(cb).not.toBeCalled()
    fireEvent.click(getByTestId('btn'))
    expect(cb).toBeCalled()
  })

  it('should focus next tab on right arrow', () => {
    const focus1 = jest.fn()
    const focus2 = jest.fn()

    const {getByTestId} = render(
      <Tabs>
        <Tab>
          <button data-testid="btn1" onFocus={focus1} />
        </Tab>
        <Tab>
          <button data-testid="btn2" onFocus={focus2} />
        </Tab>
      </Tabs>
    )

    fireEvent.keyDown(getByTestId('btn1'), {which: 39})
    expect(focus2).toBeCalledTimes(1)
    fireEvent.keyDown(getByTestId('btn2'), {which: 39})
    expect(focus1).toBeCalledTimes(1)
  })

  it('should focus prev tab on left arrow', () => {
    const focus1 = jest.fn()
    const focus2 = jest.fn()

    const {getByTestId} = render(
      <Tabs>
        <Tab>
          <button data-testid="btn1" onFocus={focus1} />
        </Tab>
        <Tab>
          <button data-testid="btn2" onFocus={focus2} />
        </Tab>
      </Tabs>
    )

    fireEvent.keyDown(getByTestId('btn1'), {which: 37})
    expect(focus2).toBeCalledTimes(1)
    fireEvent.keyDown(getByTestId('btn2'), {which: 37})
    expect(focus1).toBeCalledTimes(1)
  })

  it('should focus first tab on home key', () => {
    const focus1 = jest.fn()

    const {getByTestId} = render(
      <Tabs defaultActive={1}>
        <Tab>
          <button data-testid="btn1" onFocus={focus1} />
        </Tab>
        <Tab>
          <button data-testid="btn2" />
        </Tab>
      </Tabs>
    )

    fireEvent.keyDown(getByTestId('btn2'), {which: 36})
    expect(focus1).toBeCalledTimes(1)
  })

  it('should focus last tab on end key', () => {
    const focus1 = jest.fn()

    const {getByTestId} = render(
      <Tabs>
        <Tab>
          <button data-testid="btn1" />
        </Tab>
        <Tab>
          <button data-testid="btn2" onFocus={focus1} />
        </Tab>
      </Tabs>
    )

    fireEvent.keyDown(getByTestId('btn2'), {which: 35})
    expect(focus1).toBeCalledTimes(1)
  })

  it('should fire onDelete on delete key', () => {
    const del = jest.fn()

    const {getByTestId} = render(
      <Tabs>
        <Tab onDelete={del}>
          <button data-testid="btn1" />
        </Tab>
        <Tab>
          <button data-testid="btn2" />
        </Tab>
      </Tabs>
    )

    fireEvent.keyDown(getByTestId('btn1'), {which: 46})
    expect(del).toBeCalledTimes(1)
  })

  it('should unregister tabs', () => {
    const {rerender, asFragment} = render(
      <Tabs>
        <Tab>
          <button data-testid="btn1" />
        </Tab>
        <Tab>
          <button data-testid="btn2" />
        </Tab>
      </Tabs>
    )

    expect(asFragment()).toMatchSnapshot('two tabs')

    rerender(
      <Tabs>
        <Tab>
          <button data-testid="btn2" />
        </Tab>
      </Tabs>
    )

    expect(asFragment()).toMatchSnapshot('one tab')
  })
})

describe('<Panel>', () => {
  it('should apply activeClass/inactiveClass', () => {
    const {getByTestId} = render(
      <Tabs>
        <Panel activeClass="active">
          <div data-testid="panel1" className="tab" />
        </Panel>
        <Panel inactiveClass="inactive">
          <div data-testid="panel2" className="tab" />
        </Panel>
      </Tabs>
    )

    expect(getByTestId('panel1').getAttribute('class')).toBe('tab active')
    expect(getByTestId('panel2').getAttribute('class')).toBe('tab inactive')
  })

  it('should apply activeStyle/inactiveStyle', () => {
    const {getByTestId} = render(
      <Tabs>
        <Panel activeStyle={{display: 'block'}}>
          <div data-testid="panel1" style={{opacity: 0.5}} />
        </Panel>
        <Panel inactiveStyle={{display: 'none'}}>
          <div data-testid="panel2" style={{opacity: 0.5}} />
        </Panel>
      </Tabs>
    )

    expect(getByTestId('panel1').getAttribute('style')).toEqual(
      'visibility: visible; opacity: 0.5; display: block;'
    )
    expect(getByTestId('panel2').getAttribute('style')).toEqual(
      'visibility: hidden; opacity: 0.5; display: none;'
    )
  })

  it('should allow user-defined tabIndex', () => {
    const {getByTestId} = render(
      <Tabs>
        <Panel>
          <div tabIndex={2} data-testid="panel" />
        </Panel>
      </Tabs>
    )

    expect(getByTestId('panel').getAttribute('tabindex')).toEqual('2')
  })
})

describe('<TabList>', () => {
  it('should add role=tablist', () => {
    expect(
      render(
        <TabList>
          <div />
        </TabList>
      ).asFragment()
    ).toMatchSnapshot()
  })
})

describe('useControls()', () => {
  it('should have activate key', () => {
    const {result} = renderHook(() => useControls(0), {
      wrapper: ({children}) => (
        <Tabs>
          <Tab>
            <div />
          </Tab>
          {children as React.ReactElement}
        </Tabs>
      ),
    })

    expect(Object.keys(result.current)).toStrictEqual(['activate'])
  })
})
