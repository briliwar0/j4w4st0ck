// Script to ensure browser compatibility and handle common issues
(function() {
  // Record the page load time
  const startTime = Date.now();
  let isLoaded = false;

  // Check if the page has loaded successfully
  function pageLoadCheck() {
    const rootElement = document.getElementById('root');
    const loadTime = Date.now() - startTime;
    
    if (rootElement && rootElement.childElementCount > 0) {
      isLoaded = true;
      console.log(`Page loaded successfully in ${loadTime}ms`);
    } else if (loadTime > 10000) {
      // After 10 seconds, if the root element is still empty, consider it a loading failure
      console.error('Page failed to load properly.');
      
      // Show a simple error message
      if (rootElement) {
        rootElement.innerHTML = `
          <div style="text-align: center; padding: 20px; font-family: sans-serif;">
            <h2>JawaStock</h2>
            <p>We're experiencing technical difficulties. Please try the following:</p>
            <ul style="text-align: left; display: inline-block;">
              <li>Refresh the page</li>
              <li>Clear your browser cache</li>
              <li>Try a different browser</li>
            </ul>
            <button onclick="window.location.reload()" style="padding: 8px 16px; margin-top: 20px;">
              Refresh Page
            </button>
          </div>
        `;
      }
    }
  }

  // Check version compatibility
  function checkBrowserCompatibility() {
    const isIE = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.userAgent.indexOf('Trident/') !== -1;
    
    if (isIE) {
      alert('Internet Explorer is not supported. Please use a modern browser like Chrome, Firefox, Safari, or Edge.');
    }
    
    try {
      // Feature detection for modern JavaScript features
      eval('(async () => {})()');
      eval('const x = {...{a:1}}');
    } catch (e) {
      console.error('Browser compatibility issue:', e);
      document.body.innerHTML = `
        <div style="text-align: center; padding: 20px; font-family: sans-serif;">
          <h2>Browser Not Supported</h2>
          <p>Your browser doesn't support the modern features required by JawaStock.</p>
          <p>Please use a recent version of Chrome, Firefox, Safari, or Edge.</p>
        </div>
      `;
    }
  }

  // Run checks when the page loads
  window.addEventListener('load', function() {
    checkBrowserCompatibility();
    setTimeout(pageLoadCheck, 2000);  // Initial check after 2 seconds
    setTimeout(pageLoadCheck, 5000);  // Check again after 5 seconds
    setTimeout(pageLoadCheck, 10000); // Final check after 10 seconds
  });

  // Also check DOMContentLoaded in case 'load' doesn't fire
  window.addEventListener('DOMContentLoaded', function() {
    checkBrowserCompatibility();
  });
})();