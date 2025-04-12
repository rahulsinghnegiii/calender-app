import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { DragLayerProvider } from './components/DndContext'
import store from './redux/store'
import './index.css'
import App from './App.jsx'

/**
 * Create a wrapper for the Provider to avoid defaultProps warnings
 * Using a function declaration instead of arrow function
 */
function SafeProvider({ children, store }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SafeProvider store={store}>
      <DragLayerProvider>
        <App />
      </DragLayerProvider>
    </SafeProvider>
  </StrictMode>,
)
