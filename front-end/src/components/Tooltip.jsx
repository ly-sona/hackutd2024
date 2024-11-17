import React from 'react';
import './Tooltip.css';

const Tooltip = ({ term, definition }) => {
  return (
    <span className="tooltip">
      {term}
      <span className="tooltip-text">{definition}</span>
    </span>
  );
};

export default Tooltip;
