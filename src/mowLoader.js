/* global MoW */

/**
 * Utility to check if MoW API is loaded and handle loading states
 */

/**
 * Check if MoW API is available
 * @returns {boolean} True if MoW is available
 */
export const isMoWAvailable = () => {
  if (typeof window === 'undefined') return false;
  
  const hasMoW = typeof window.MoW !== 'undefined';
  if (hasMoW) {
    console.log('MoW API detected:', {
      hasMoW: true,
      hasMap: typeof window.MoW.Map !== 'undefined',
      hasBasemap: typeof window.MoW.Basemap !== 'undefined',
      hasReady: typeof window.MoW.ready === 'function'
    });
  }
  return hasMoW;
};

/**
 * Check if there was an error loading MoW
 * @returns {boolean} True if there was a load error
 */
export const hasMoWLoadError = () => {
  return typeof window !== 'undefined' && window.MoWLoadError === true;
};

/**
 * Wait for MoW API to be ready with timeout
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<boolean>} Resolves to true if MoW is ready, false if timeout
 */
export const waitForMoW = (timeout = 10000) => {
  return new Promise((resolve) => {
    if (isMoWAvailable()) {
      resolve(true);
      return;
    }

    if (hasMoWLoadError()) {
      resolve(false);
      return;
    }

    let checkInterval;
    const startTime = Date.now();

    const checkMoW = () => {
      if (isMoWAvailable()) {
        clearInterval(checkInterval);
        resolve(true);
        return;
      }

      if (hasMoWLoadError()) {
        clearInterval(checkInterval);
        resolve(false);
        return;
      }

      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        console.warn('MoW API load timeout after', timeout, 'ms');
        resolve(false);
        return;
      }
    };

    // Check every 100ms
    checkInterval = setInterval(checkMoW, 100);
    checkMoW(); // Initial check
  });
};

/**
 * Initialize MoW with error handling
 * @param {Function} callback - Callback function that receives error (null if success)
 * @param {number} timeout - Timeout in milliseconds
 */
export const initMoW = async (callback, timeout = 10000) => {
  const isReady = await waitForMoW(timeout);
  
  if (!isReady) {
    const error = new Error('MoW API failed to load. Check network connection and CORS settings.');
    console.error(error.message);
    if (callback) {
      callback(error);
    }
    return;
  }

  try {
    console.log('Calling MoW.ready()...');
    MoW.ready(() => {
      console.log('MoW.ready() callback executed');
      console.log('MoW object:', {
        Map: typeof MoW.Map,
        Basemap: typeof MoW.Basemap,
        ready: typeof MoW.ready
      });
      
      if (callback) {
        callback(null); // No error, MoW is available globally
      }
    });
  } catch (error) {
    console.error('Error calling MoW.ready():', error);
    if (callback) {
      callback(error);
    }
  }
};

