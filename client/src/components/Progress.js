import React from 'react';
import PropTypes from 'prop-types';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Progress = ({ percentage,message }) => {
  return (
    <CircularProgressbar
      className="myProgress"
      value={percentage}
      text={`${percentage}%`}
      background={true}
      styles={{
        // Customize the path, i.e. the "completed progress"
        path: {
          // Path color
          stroke: `#ff9ff3`,
          // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
          strokeLinecap: 'rounded',
          // Customize transition animation
          transition: 'stroke-dashoffset 0.5s ease 0s',
        },
        // Customize the circle behind the path, i.e. the "total progress"
        trail: {
          // Trail color
          stroke: '#c8d6e5',
          // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
          strokeLinecap: 'rounded',
        },
        // Customize the text
        text: {
          // Text color
          fill: '#fefefe',
          // Text size
          fontSize: '12px',
        },
        // Customize background - only used when the `background` prop is true
        background: {
          fill: '#222f3e',
        },
      }}
    >
    {percentage}%
    </CircularProgressbar>
  );
};

Progress.propTypes = {
  percentage: PropTypes.number.isRequired,
  message: PropTypes.string.isRequired,
};

export default Progress;
