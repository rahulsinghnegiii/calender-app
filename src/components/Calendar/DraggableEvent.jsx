import React from 'react';
import { useDrag } from 'react-dnd';
import { getEventStyle } from '../../utils/eventUtils';

const DraggableEvent = ({ event }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'EVENT',
    item: { id: event.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const style = {
    ...getEventStyle(event.category),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={drag}
      className="cursor-grab active:cursor-grabbing"
      style={style}
    >
      <div className="p-1 truncate">
        <strong>{event.title}</strong>
      </div>
    </div>
  );
};

export default DraggableEvent; 