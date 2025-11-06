/* global MoW */

/**
 * Helper functions for MoW (Map of the World) API integration
 */

/**
 * Gets available basemap IDs from MoW.Basemap.ID
 * @returns {Object|null} Object with basemap ID constants or null if not available
 */
export const getBasemapIDs = () => {
  if (typeof window === 'undefined' || !window.MoW || !window.MoW.Basemap || !window.MoW.Basemap.ID) {
    return null;
  }
  return window.MoW.Basemap.ID;
};

/**
 * Creates a basemap using the MoW Basemap API
 * @param {string} name - The name of the basemap
 * @param {MoW.Protocol|Array.<MoW.Protocol>} protocol - The protocol(s) used to retrieve and load layer
 * @param {string|MoW.Description} description - Optional description
 * @param {string} id - Optional unique ID (will be generated if not supplied)
 * @param {boolean} clickable - Whether this basemap returns results when clicked (default: true)
 * @param {Object} options - Optional configuration
 * @returns {MoW.Basemap} The created basemap object
 */
export const createBasemap = (name, protocol, description = null, id = null, clickable = true, options = {}) => {
  try {
    const basemapConfig = {
      imageryLayer: options.imageryLayer || false,
      hideLayerInLegend: options.hideLayerInLegend || false
    };

    const basemapOptions = {
      secondaryTitleTemplate: options.secondaryTitleTemplate || null
    };

    // Create description object if string is provided
    let descriptionObj = description;
    if (typeof description === 'string') {
      descriptionObj = new MoW.Description(description);
    }

    const basemap = new MoW.Basemap(
      name,
      protocol,
      descriptionObj,
      id,
      clickable,
      options.clicktemplate || null,
      options.summarytemplate || null,
      basemapConfig,
      basemapOptions,
      options.filters || null
    );

    return basemap;
  } catch (error) {
    console.error('Error creating basemap:', error);
    throw error;
  }
};

/**
 * Sets a basemap on a MoW map instance
 * @param {MoW.Map} mapInstance - The MoW map instance
 * @param {string|MoW.Basemap} basemap - Basemap ID or Basemap object
 */
export const setMapBasemap = (mapInstance, basemap) => {
  if (!mapInstance) {
    console.error('Map instance is required');
    return;
  }

  try {
    if (typeof basemap === 'string') {
      // If it's a string, assume it's a basemap ID
      console.log('Setting basemap by ID:', basemap);
      mapInstance.setBasemap(basemap);
    } else if (basemap && basemap.id) {
      // If it's a Basemap object, add it first then set it
      console.log('Adding and setting basemap:', basemap.id);
      mapInstance.addBasemap(basemap);
      mapInstance.setBasemap(basemap.id);
    } else {
      console.error('Invalid basemap parameter. Expected string (ID) or Basemap object.');
    }
  } catch (error) {
    console.error('Error setting basemap:', error);
    throw error;
  }
};

/**
 * List of common basemap IDs (from MoW.Basemap.ID)
 */
export const BASEMAP_IDS = {
  STREETS: 'STREETS',
  BEST_AVAILABLE: 'BEST_AVAILABLE',
  OPEN_STREETMAP: 'OPEN_STREETMAP',
  SHADED_RELIEF: 'SHADED_RELIEF',
  HILLSHADE: 'HILLSHADE',
  CANVAS_GRAY: 'CANVAS_GRAY',
  CANVAS_MIDNIGHT: 'CANVAS_MIDNIGHT',
  CANVAS_SLATE: 'CANVAS_SLATE',
  LOW_BW_CADRG: 'LOW_BW_CADRG',
  HIGH_BW_CADRG: 'HIGH_BW_CADRG',
  AUTOSCALING: 'AUTOSCALING'
};

/**
 * Example: Create a WMS basemap
 * Note: You'll need to provide actual WMS protocol parameters
 * 
 * const wmsProtocol = new MoW.WMSProtocol({
 *   url: 'https://your-wms-server.com/wms',
 *   layers: 'your_layer_name',
 *   version: '1.1.0'
 * });
 * 
 * const basemap = createBasemap(
 *   'My Custom Basemap',
 *   wmsProtocol,
 *   'Description of the basemap',
 *   'my_basemap_id',
 *   true,
 *   {
 *     imageryLayer: false,
 *     hideLayerInLegend: false
 *   }
 * );
 * 
 * setMapBasemap(mapInstance, basemap);
 */
