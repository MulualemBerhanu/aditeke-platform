import React from 'react';
import CountUp from 'react-countup';

interface CustomCountUpProps {
  start?: number;
  end: number;
  decimals?: number;
  delay?: number;
  suffix?: string;
  duration?: number;
  prefix?: string;
  className?: string;
  useEasing?: boolean;
}

const CustomCountUp: React.FC<CustomCountUpProps> = ({
  start = 0,
  end,
  decimals = 0,
  delay = 0,
  suffix = '',
  prefix = '',
  duration = 2.5,
  className = '',
  useEasing = true
}) => {
  return (
    <span className={className}>
      <CountUp
        start={start}
        end={end}
        decimals={decimals}
        delay={delay}
        duration={duration}
        useEasing={useEasing}
        formattingFn={(value) => {
          return `${prefix}${value}${suffix}`;
        }}
      />
    </span>
  );
};

export default CustomCountUp;