// Simple implementation to avoid encoding issues
import { useState, createContext, useContext } from 'react';

// Create a context for the drag layer
export const DragLayerContext = createContext({
  isDragging: false,
  item: null,
  currentOffset: null,
  updateDragState: () => {}
});

// Provider component
export const DragLayerProvider = ({ children }) => {
  const [state, setState] = useState({
    isDragging: false,
    item: null,
    currentOffset: null
  });

  const updateDragState = (newState) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  return (
    <DragLayerContext.Provider value={{ ...state, updateDragState }}>
      {children}
    </DragLayerContext.Provider>
  );
};

// Hook to access drag state
export const useDragLayer = (collect = state => state) => {
  const context = useContext(DragLayerContext);
  return collect(context);
};

// Hook to update drag state
export const useDragLayerUpdater = () => {
  const { updateDragState } = useContext(DragLayerContext);
  
  const startDrag = (item, position) => {
    updateDragState({
      isDragging: true,
      item,
      currentOffset: position
    });
  };
  
  const endDrag = () => {
    updateDragState({
      isDragging: false,
      item: null,
      currentOffset: null
    });
  };
  
  return { startDrag, endDrag, updateDragState };
};

export default {
  useDragLayer,
  useDragLayerUpdater,
  DragLayerProvider
}; 