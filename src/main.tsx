
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
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
    // Filter out browser extension errors and other non-actionable warnings
    const errorText = args.join(' ');
    if (errorText.includes('contentScript.js') || 
        errorText.includes('Unrecognized feature') ||
        errorText.includes('preloaded using link preload') ||
        errorText.includes('allowedOriginsToCommunicateWith') ||
        errorText.includes('Failed to load resource: net::ERR_BLOCKED_BY_CLIENT') ||
        errorText.includes('BloomFilter error') ||
        errorText.includes('A listener indicated an asynchronous response') ||
        errorText.includes('ipapi.co') ||
        errorText.includes('ipgeolocation.io') ||
        errorText.includes('API_KEY_HERE') ||
        // Filter out Recharts YAxis warnings
        errorText.includes('Support for defaultProps will be removed') ||
        errorText.includes('YAxis: Support for defaultProps')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  // Filter console warnings
  console.warn = function filterWarning(...args) {
    // Filter out preload warnings and other non-actionable warnings
    const warningText = args.join(' ');
    if (warningText.includes('preloaded using link preload') ||
        warningText.includes('Unrecognized feature') ||
        warningText.includes('ipapi.co') ||
        warningText.includes('ipgeolocation.io') ||
        warningText.includes('API_KEY_HERE') ||
        // Filter out Recharts YAxis warnings
        warningText.includes('Support for defaultProps will be removed') ||
        warningText.includes('YAxis: Support for defaultProps')) {
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
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
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
