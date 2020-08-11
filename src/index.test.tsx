/* eslint-disable jsx-a11y/click-events-have-key-events */
/* jest */
import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Tabs, Tab, Panel, TabList} from './index'

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
    render(
      <Tabs active={0} onChange={cb}>
        <Tab>
          <div />
        </Tab>
        <Tab>
          <div data-testid='btn' />
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
    userEvent.click(screen.getByTestId('btn'))
    expect(cb).toBeCalledWith(1, 0)
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
    render(
      <Tabs>
        <Tab>
          <div />
        </Tab>
        <Tab>
          <div data-testid='btn' />
        </Tab>
      </Tabs>
    )

    expect(screen.getByTestId('btn')).toHaveAttribute('aria-selected', 'false')
    userEvent.click(screen.getByTestId('btn'))
    expect(screen.getByTestId('btn')).toHaveAttribute('aria-selected', 'true')
  })

  it('should not activate if disabled', () => {
    render(
      <Tabs>
        <Tab>
          <div />
        </Tab>
        <Tab disabled>
          <div data-testid='btn' />
        </Tab>
      </Tabs>
    )

    expect(screen.getByTestId('btn')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByTestId('btn')).toHaveAttribute('aria-selected', 'false')
    userEvent.click(screen.getByTestId('btn'))
    expect(screen.getByTestId('btn')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByTestId('btn')).toHaveAttribute('aria-selected', 'false')
  })

  it('should apply activeClass/inactiveClass', () => {
    render(
      <Tabs>
        <Tab activeClass='active'>
          <div data-testid='btn1' className='tab' />
        </Tab>
        <Tab inactiveClass='inactive'>
          <div data-testid='btn2' className='tab' />
        </Tab>
      </Tabs>
    )

    expect(screen.getByTestId('btn1')).toHaveAttribute('class', 'tab active')
    expect(screen.getByTestId('btn2')).toHaveAttribute('class', 'tab inactive')
  })

  it('should apply activeStyle/inactiveStyle', () => {
    render(
      <Tabs>
        <Tab activeStyle={{display: 'block'}}>
          <div data-testid='btn1' style={{opacity: 0.5}} />
        </Tab>
        <Tab inactiveStyle={{display: 'none'}}>
          <div data-testid='btn2' style={{opacity: 0.5}} />
        </Tab>
      </Tabs>
    )

    expect(screen.getByTestId('btn1')).toHaveAttribute(
      'style',
      'opacity: 0.5; display: block;'
    )
    expect(screen.getByTestId('btn2')).toHaveAttribute(
      'style',
      'opacity: 0.5; display: none;'
    )
  })

  it('should allow user-defined tabIndex', () => {
    render(
      <Tabs>
        <Tab>
          <div tabIndex={2} data-testid='btn' />
        </Tab>
      </Tabs>
    )

    expect(screen.getByTestId('btn')).toHaveAttribute('tabindex', '2')
  })

  it('should fire user-defined onFocus', () => {
    const cb = jest.fn()

    render(
      <Tabs>
        <Tab>
          <div onFocus={cb} data-testid='btn' />
        </Tab>
      </Tabs>
    )

    expect(cb).not.toBeCalled()
    fireEvent.focus(screen.getByTestId('btn'))
    expect(cb).toBeCalled()
  })

  it('should fire user-defined onClick', () => {
    const cb = jest.fn()

    render(
      <Tabs>
        <Tab>
          <div onClick={cb} data-testid='btn' />
        </Tab>
      </Tabs>
    )

    expect(cb).not.toBeCalled()
    userEvent.click(screen.getByTestId('btn'))
    expect(cb).toBeCalled()
  })

  it('should focus next tab on right arrow', () => {
    const focus1 = jest.fn()
    const focus2 = jest.fn()

    render(
      <Tabs>
        <Tab>
          <button data-testid='btn1' onFocus={focus1} />
        </Tab>
        <Tab>
          <button data-testid='btn2' onFocus={focus2} />
        </Tab>
      </Tabs>
    )

    fireEvent.keyDown(screen.getByTestId('btn1'), {key: 'ArrowRight'})
    expect(focus2).toBeCalledTimes(1)
    fireEvent.keyDown(screen.getByTestId('btn2'), {key: 'ArrowRight'})
    expect(focus1).toBeCalledTimes(1)
  })

  it('should focus prev tab on left arrow', () => {
    const focus1 = jest.fn()
    const focus2 = jest.fn()

    render(
      <Tabs>
        <Tab>
          <button data-testid='btn1' onFocus={focus1} />
        </Tab>
        <Tab>
          <button data-testid='btn2' onFocus={focus2} />
        </Tab>
      </Tabs>
    )

    fireEvent.keyDown(screen.getByTestId('btn1'), {key: 'ArrowLeft'})
    expect(focus2).toBeCalledTimes(1)
    fireEvent.keyDown(screen.getByTestId('btn2'), {key: 'ArrowLeft'})
    expect(focus1).toBeCalledTimes(1)
  })

  it('should focus first tab on home key', () => {
    const focus1 = jest.fn()

    render(
      <Tabs defaultActive={1}>
        <Tab>
          <button data-testid='btn1' onFocus={focus1} />
        </Tab>
        <Tab>
          <button data-testid='btn2' />
        </Tab>
      </Tabs>
    )

    fireEvent.keyDown(screen.getByTestId('btn2'), {key: 'Home'})
    expect(focus1).toBeCalledTimes(1)
  })

  it('should focus last tab on end key', () => {
    const focus1 = jest.fn()

    render(
      <Tabs>
        <Tab>
          <button data-testid='btn1' />
        </Tab>
        <Tab>
          <button data-testid='btn2' onFocus={focus1} />
        </Tab>
      </Tabs>
    )

    fireEvent.keyDown(screen.getByTestId('btn2'), {key: 'End'})
    expect(focus1).toBeCalledTimes(1)
  })

  it('should fire onDelete on delete key', () => {
    const del = jest.fn()

    render(
      <Tabs>
        <Tab onDelete={del}>
          <button data-testid='btn1' />
        </Tab>
        <Tab>
          <button data-testid='btn2' />
        </Tab>
      </Tabs>
    )

    fireEvent.keyDown(screen.getByTestId('btn1'), {key: 'Delete'})
    expect(del).toBeCalledTimes(1)
  })

  it('should unregister tabs', () => {
    const {rerender, asFragment} = render(
      <Tabs>
        <Tab>
          <button data-testid='btn1' />
        </Tab>
        <Tab>
          <button data-testid='btn2' />
        </Tab>
      </Tabs>
    )

    expect(asFragment()).toMatchSnapshot('two tabs')

    rerender(
      <Tabs>
        <Tab>
          <button data-testid='btn2' />
        </Tab>
      </Tabs>
    )

    expect(asFragment()).toMatchSnapshot('one tab')
  })
})

describe('<Panel>', () => {
  it('should apply activeClass/inactiveClass', () => {
    render(
      <Tabs>
        <Panel activeClass='active'>
          <div data-testid='panel1' className='tab' />
        </Panel>
        <Panel inactiveClass='inactive'>
          <div data-testid='panel2' className='tab' />
        </Panel>
      </Tabs>
    )

    expect(screen.getByTestId('panel1')).toHaveAttribute('class', 'tab active')
    expect(screen.getByTestId('panel2')).toHaveAttribute(
      'class',
      'tab inactive'
    )
  })

  it('should apply activeStyle/inactiveStyle', () => {
    render(
      <Tabs>
        <Panel activeStyle={{display: 'block'}}>
          <div data-testid='panel1' style={{opacity: 0.5}} />
        </Panel>
        <Panel inactiveStyle={{display: 'none'}}>
          <div data-testid='panel2' style={{opacity: 0.5}} />
        </Panel>
      </Tabs>
    )

    expect(screen.getByTestId('panel1')).toHaveAttribute(
      'style',
      'visibility: visible; opacity: 0.5; display: block;'
    )
    expect(screen.getByTestId('panel2')).toHaveAttribute(
      'style',
      'visibility: hidden; opacity: 0.5; display: none;'
    )
  })

  it('should allow user-defined tabIndex', () => {
    render(
      <Tabs>
        <Panel>
          <div tabIndex={2} data-testid='panel' />
        </Panel>
      </Tabs>
    )

    expect(screen.getByTestId('panel')).toHaveAttribute('tabindex', '2')
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
