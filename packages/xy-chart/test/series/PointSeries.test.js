import React from 'react';
import { shallow, mount } from 'enzyme';

import { XYChart, PointSeries } from '../../src/';
import GlyphDotComponent from '../../src/glyph/GlyphDotComponent';

describe('<PointSeries />', () => {
  const mockProps = {
    xScale: { type: 'time' },
    yScale: { type: 'linear', includeZero: false },
    width: 100,
    height: 100,
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    ariaLabel: 'label',
  };

  const mockData = [
    { date: new Date('2017-01-05'), cat: 'a', num: 15 },
    { date: new Date('2018-01-05'), cat: 'b', num: 51 },
    { date: new Date('2019-01-05'), cat: 'c', num: 377 },
  ];

  test('it should be defined', () => {
    expect(PointSeries).toBeDefined();
  });

  test('it should not render without x- and y-scales', () => {
    expect(shallow(<PointSeries data={[]} />).type()).toBeNull();
  });

  test('it should render a GlyphDotComponent for each datum', () => {
    const wrapper = shallow(
      <XYChart {...mockProps} >
        <PointSeries data={mockData.map(d => ({ ...d, x: d.date, y: d.num }))} />
      </XYChart>,
    );
    expect(wrapper.find(PointSeries).length).toBe(1);
    expect(wrapper.find(PointSeries).dive().find(GlyphDotComponent).length).toBe(mockData.length);
  });

  test('it should not render points for null data', () => {
    const wrapper = shallow(
      <XYChart {...mockProps} >
        <PointSeries
          data={mockData.map((d, i) => ({ // test null x AND y's
            x: i === 0 ? null : d.date,
            y: i === 1 ? null : d.num,
          }))}
        />
      </XYChart>,
    );
    const series = wrapper.find(PointSeries).dive();
    expect(series.find(GlyphDotComponent).length).toBe(mockData.length - 2);
  });

  test('it should render labels if present', () => {
    const wrapper = shallow(
      <XYChart {...mockProps} >
        <PointSeries
          data={mockData.map((d, i) => ({
            x: d.date,
            y: d.num,
            label: i === 0 ? 'LABEL' : null,
          }))}
          labelComponent={<text className="test" />}
        />
      </XYChart>,
    );
    const label = wrapper.render().find('.test');
    expect(label.length).toBe(1);
    expect(label.text()).toBe('LABEL');
  });

  test('it should call onMouseMove({ datum, data, event, color }), onMouseLeave(), and onClick({ datum, data, event, color }) on trigger', () => {
    const data = mockData.map(d => ({ ...d, x: d.date, y: d.num }));
    const onMouseMove = jest.fn();
    const onMouseLeave = jest.fn();
    const onClick = jest.fn();

    const wrapper = mount(
      <XYChart
        {...mockProps}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <PointSeries data={data} fill="army-green" />
      </XYChart>,
    );

    const point = wrapper.find('circle').first();

    point.simulate('mousemove');
    expect(onMouseMove).toHaveBeenCalledTimes(1);
    let args = onMouseMove.mock.calls[0][0];
    expect(args.data).toBe(data);
    expect(args.datum).toBe(data[0]);
    expect(args.event).toBeDefined();
    expect(args.color).toBe('army-green');

    point.simulate('mouseleave');
    expect(onMouseLeave).toHaveBeenCalledTimes(1);

    point.simulate('click');
    expect(onClick).toHaveBeenCalledTimes(1);
    args = onClick.mock.calls[0][0];
    expect(args.data).toBe(data);
    expect(args.datum).toBe(data[0]);
    expect(args.event).toBeDefined();
    expect(args.color).toBe('army-green');
  });

  test('it should not trigger onMouseMove, onMouseLeave, or onClick if disableMouseEvents is true', () => {
    const data = mockData.map(d => ({ ...d, x: d.date, y: d.num }));
    const onMouseMove = jest.fn();
    const onMouseLeave = jest.fn();
    const onClick = jest.fn();

    const wrapper = mount(
      <XYChart
        {...mockProps}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <PointSeries data={data} disableMouseEvents />
      </XYChart>,
    );

    const point = wrapper.find('circle').first();

    point.simulate('mousemove');
    expect(onMouseMove).toHaveBeenCalledTimes(0);

    point.simulate('mouseleave');
    expect(onMouseLeave).toHaveBeenCalledTimes(0);

    point.simulate('click');
    expect(onClick).toHaveBeenCalledTimes(0);
  });
});
