import React from 'react';
import { svgPaths } from './svgPaths';

interface SvgIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties; // Correct type for style prop
}

const SvgIcon: React.FC<SvgIconProps> = ({ name, className, style }) => {
  const paths = svgPaths[name];

  if (!paths) {
    console.error(`No SVG paths found for name: ${name}`);
    return null;
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      style={style} 
    >
      {paths.map((d, index) => (
        <path
          key={index}
          d={d}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.2"
        />
      ))}
    </svg>
  );
};

export default SvgIcon;