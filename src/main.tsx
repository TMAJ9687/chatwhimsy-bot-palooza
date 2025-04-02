
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/performance.css'
import { setupGlobalErrorHandling } from './utils/errorHandler'

// Set up global error handling before the app renders
setupGlobalErrorHandling();

// Create a stable root for the app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

// Filter out noisy console messages in production
if (process.env.NODE_ENV === 'production') {
  // Store the original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Filter console errors
  console.error = function filterError(...args) {
    // Filter out Firebase-related errors and browser extension errors
    const errorText = args.join(' ');
    if (errorText.includes('firebase') || 
        errorText.includes('Firestore') ||
        errorText.includes('contentScript.js') ||
        errorText.includes('Unrecognized feature') ||
        errorText.includes('preloaded using link preload') ||
        errorText.includes('allowedOriginsToCommunicateWith')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  // Filter console warnings
  console.warn = function filterWarning(...args) {
    // Filter out Firebase-related warnings
    const warningText = args.join(' ');
    if (warningText.includes('firebase') || 
        warningText.includes('Firestore') ||
        warningText.includes('preloaded using link preload')) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

// Create a custom error handler for React rendering errors
const handleRenderError = (error: Error) => {
  console.error("Error during React rendering:", error);
  // Try to clean up the DOM
  if (typeof document !== 'undefined' && document.body) {
    document.body.style.overflow = 'auto';
    document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
  }
};

// Attempt to render with error handling
try {
  // Render with a try-catch to catch initial render errors
  root.render(<App />);
} catch (error) {
  handleRenderError(error as Error);
  // Try to render again with just a minimal app
  try {
    root.render(
      <div className="p-4">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p>The application encountered an error. Please try refreshing the page.</p>
      </div>
    );
  } catch {
    // If all else fails, add content directly to the DOM
    if (rootElement) {
      rootElement.innerHTML = `
        <div class="p-4">
          <h1 class="text-xl font-bold">Critical Error</h1>
          <p>The application failed to render. Please refresh the page.</p>
        </div>
      `;
    }
  }
}
