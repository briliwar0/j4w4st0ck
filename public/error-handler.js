/**
 * JawaStock Error Handler
 * Provides early error detection and redirection before React loads
 */
(function() {
  // Listen for errors that occur during initial loading
  window.addEventListener('error', function(event) {
    if (document.readyState !== 'complete') {
      handleEarlyError(event.error || { message: event.message });
    }
  }, { once: false, capture: true });

  // Check for React loading failure
  window.addEventListener('load', function() {
    setTimeout(function() {
      const rootElement = document.getElementById('root');
      // If root is empty after load, React probably failed to start
      if (rootElement && (!rootElement.childNodes.length || rootElement.childNodes.length === 1 && 
          rootElement.childNodes[0].tagName === 'DIV' && 
          rootElement.childNodes[0].innerHTML.includes('Loading'))) {
        handleEarlyError({ message: "Application failed to initialize. This could be due to a network issue or a problem with the application." });
      }
    }, 5000); // Give React 5 seconds to load
  });

  function handleEarlyError(error) {
    console.error('Critical error during application initialization:', error);
    
    // Store error information for the error page
    try {
      sessionStorage.setItem('jawastock_error', error.message || 'Unknown initialization error');
    } catch (e) {
      // Session storage might be unavailable, continue anyway
    }
    
    // Check if we're already on the error page to avoid redirect loops
    if (!window.location.pathname.includes('/error-info')) {
      // Create temporary visible error message while redirecting
      const tempErrorMessage = document.createElement('div');
      tempErrorMessage.style.position = 'fixed';
      tempErrorMessage.style.top = '0';
      tempErrorMessage.style.left = '0';
      tempErrorMessage.style.width = '100%';
      tempErrorMessage.style.padding = '15px';
      tempErrorMessage.style.backgroundColor = '#fff9db';
      tempErrorMessage.style.borderBottom = '1px solid #fcc419';
      tempErrorMessage.style.zIndex = '9999';
      tempErrorMessage.style.textAlign = 'center';
      tempErrorMessage.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      tempErrorMessage.innerHTML = `
        <p style="margin: 0;">Redirecting to error details page...</p>
      `;
      document.body.prepend(tempErrorMessage);
      
      // Redirect to error page after a short delay to allow the message to be seen
      setTimeout(function() {
        window.location.href = '/error-info?message=' + encodeURIComponent(error.message || 'Application initialization failed');
      }, 1000);
    }
  }
})();