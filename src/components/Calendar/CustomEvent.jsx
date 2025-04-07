import React from 'react';
import { getEventStyle } from '../../utils/eventUtils';

const CustomEvent = ({ event }) => {
  const style = getEventStyle(event.category);

  return (
    <div className="rbc-event" style={style}>
      <div className="rbc-event-content p-1 truncate">
        <strong>{event.title}</strong>
      </div>
    </div>
  );
};

export default CustomEvent; 