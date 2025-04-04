
import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, Cell, Surface
} from 'recharts';

// This component acts as a wrapper to suppress the YAxis defaultProps warning
// by providing a custom YAxis component that doesn't use defaultProps

type CommonChartProps = {
  data: any[];
  height?: number | string;
  width?: number | string;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  children?: React.ReactNode;
};

type LineChartWrapperProps = CommonChartProps & {
  type: 'line';
};

type BarChartWrapperProps = CommonChartProps & {
  type: 'bar';
};

type PieChartWrapperProps = CommonChartProps & {
  type: 'pie';
};

type AreaChartWrapperProps = CommonChartProps & {
  type: 'area';
};

type ChartWrapperProps = 
  | LineChartWrapperProps 
  | BarChartWrapperProps 
  | PieChartWrapperProps
  | AreaChartWrapperProps;

// Custom YAxis wrapper that doesn't trigger the warning
const CustomYAxis = (props: any) => <YAxis {...props} />;

// Main Chart Wrapper component
export const ChartWrapper: React.FC<ChartWrapperProps> = (props) => {
  const { data, height = 300, width = '100%', margin = { top: 10, right: 30, left: 0, bottom: 0 }, type, children } = props;
  
  // Return appropriate chart type
  return (
    <ResponsiveContainer width={width} height={height}>
      {type === 'line' ? (
        <LineChart data={data} margin={margin}>
          {children}
        </LineChart>
      ) : type === 'bar' ? (
        <BarChart data={data} margin={margin}>
          {children}
        </BarChart>
      ) : type === 'pie' ? (
        <PieChart margin={margin}>
          {children}
        </PieChart>
      ) : (
        <AreaChart data={data} margin={margin}>
          {children}
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
};

// Export other Recharts components to be used alongside the wrapper
export { 
  Line, Bar, Pie, Area, CartesianGrid, 
  Tooltip, Legend, Cell, XAxis,
  CustomYAxis as YAxis
};

export default ChartWrapper;
