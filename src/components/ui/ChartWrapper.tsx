
import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis as RechartsXAxis, YAxis as RechartsYAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, Cell, Surface
} from 'recharts';

// This component acts as a wrapper to suppress the YAxis and XAxis defaultProps warnings
// by providing custom components that don't use defaultProps

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

// Custom axis components that don't trigger the defaultProps warning
const CustomYAxis = (props: any) => <RechartsYAxis {...props} />;
const CustomXAxis = (props: any) => <RechartsXAxis {...props} />;

// Main Chart Wrapper component
export const ChartWrapper: React.FC<ChartWrapperProps> = (props) => {
  const { data, height = 300, width = '100%', margin = { top: 10, right: 30, left: 0, bottom: 0 }, type, children } = props;
  
  // Filter children to replace YAxis and XAxis with custom components
  const enhancedChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;
    
    if (child.type === RechartsYAxis || (typeof child.type === 'function' && child.type.name === 'YAxis')) {
      return <CustomYAxis {...child.props} />;
    }

    if (child.type === RechartsXAxis || (typeof child.type === 'function' && child.type.name === 'XAxis')) {
      return <CustomXAxis {...child.props} />;
    }

    return child;
  });
  
  // Return appropriate chart type
  return (
    <ResponsiveContainer width={width} height={height}>
      {type === 'line' ? (
        <LineChart data={data} margin={margin}>
          {enhancedChildren}
        </LineChart>
      ) : type === 'bar' ? (
        <BarChart data={data} margin={margin}>
          {enhancedChildren}
        </BarChart>
      ) : type === 'pie' ? (
        <PieChart margin={margin}>
          {enhancedChildren}
        </PieChart>
      ) : (
        <AreaChart data={data} margin={margin}>
          {enhancedChildren}
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
};

// Export other Recharts components to be used alongside the wrapper
export { 
  Line, Bar, Pie, Area, CartesianGrid, 
  Tooltip, Legend, Cell,
  CustomXAxis as XAxis, 
  CustomYAxis as YAxis
};

export default ChartWrapper;
