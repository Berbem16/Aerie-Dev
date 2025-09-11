# UAS Reporting Tool

A containerized web application for reporting UAS (Unmanned Aerial System) sightings with a React frontend, FastAPI backend, and PostgreSQL database.

## Features

- Report UAS sightings with type, time, location, and description
- Submit and save functionality
- View recent sightings with advanced search capabilities
- Export data as JSON
- Black background with yellow text styling
- Light gray input boxes
- **NEW**: PostgreSQL database for persistent data storage
- **NEW**: Fully containerized with Docker
- **NEW**: Location search with geocoding API integration
- **NEW**: Separate latitude and longitude coordinate inputs
- **NEW**: Automatic coordinate population using geocoding APIs
- **NEW**: Interactive map tile for visual coordinate selection
- **NEW**: Type of Sighting dropdown with standardized options
- **NEW**: Auto-fill current date/time with manual override
- **NEW**: Advanced search functionality for sightings
- **NEW**: Symbol code auto-population for UAS - Fixed Wing sightings
- **NEW**: pgAdmin database management interface with auto-connect
- **NEW**: Two-way map interaction (search → map, map → search)
- **NEW**: Reverse geocoding for map clicks
- **NEW**: DateTime formatting (YYYY-MM-DDTHH:MM display format)
- **NEW**: Proper timezone handling and ISO datetime conversion

## Location Search & Geocoding Integration

The application now features intelligent location search with automatic coordinate population using multiple geocoding APIs. Users can search for any location worldwide and get precise coordinates automatically.

### How It Works

1. **Location Input**: Type any location (e.g., "Pittsburgh, PA", "Ramstein Air Base", "Berlin, Germany")
2. **Search Button**: Click "Search" or press Enter to trigger the geocoding API
3. **Automatic Coordinate Population**: The app automatically fills latitude and longitude fields with precise coordinates
4. **Location Name Update**: The location field updates with the full address returned by the API
5. **Manual Override**: You can still edit the coordinates manually if needed

### Supported Geocoding Services

The system uses a multi-tier approach for maximum reliability:
1. **Nominatim (OpenStreetMap)**: Primary geocoding service for general locations
2. **OSRM Geocoding**: Secondary service for routing-optimized results
3. **Hardcoded Fallback**: Known military locations in Germany for guaranteed results

### Technical Implementation

The geocoding system provides:
- **Global Coverage**: Search any location worldwide
- **High Accuracy**: Multiple API sources ensure precise coordinates
- **Reliability**: Fallback system ensures coordinates are always available
- **Speed**: Optimized API calls with proper error handling
- **User Experience**: Real-time feedback and loading states

## Interactive Map Feature

The application now includes an interactive map tile that allows users to visually select locations and get precise coordinates with two-way interaction.

### How It Works

1. **Map Display**: A map tile from OpenStreetMap is displayed to the right of the form
2. **Click to Select**: Users can click anywhere on the map to get coordinates
3. **Auto-population**: Clicking on the map automatically fills the latitude and longitude fields
4. **Reverse Geocoding**: Map clicks also populate the location name field
5. **Search to Map**: Location searches automatically center the map and drop a pin
6. **Zoom Controls**: +/- buttons allow users to zoom in/out for more precise selection
7. **Visual Pins**: Red pin markers show selected locations

### Map Features

- **OpenStreetMap Tiles**: High-quality map rendering with worldwide coverage
- **Two-Way Interaction**: Search locations center the map, map clicks populate the form
- **Reverse Geocoding**: Coordinates are converted back to location names
- **Visual Feedback**: Red pin markers show selected locations
- **Responsive Design**: Adapts to different screen sizes
- **Coordinate Precision**: Provides coordinates to 6 decimal places for accuracy

### Benefits

- **Visual Location Selection**: Users can see exactly where they're selecting coordinates
- **Complete Workflow**: Search by name or click on map - both populate all fields
- **Precision**: Allows fine-tuning of coordinates by zooming and clicking
- **User Experience**: More intuitive than manually typing coordinates
- **Location Verification**: See exactly where coordinates point to on the map

## Advanced Search Functionality

The application includes powerful search capabilities for finding and filtering sightings.

### Search Features

1. **Multi-Field Search**: Search across all sighting data:
   - Location names (e.g., "Ramstein", "Pittsburgh")
   - Coordinates (e.g., "49.4521", "40.4406")
   - Sighting types (e.g., "UAS", "Fixed Wing")
   - Descriptions (any text content)
   - Symbol codes (e.g., "SHAPMF--***")

2. **Real-Time Filtering**: Results update instantly as you type
3. **Results Counter**: Shows "Showing X of Y sightings matching 'search term'"
4. **Clear Search**: One-click button to reset and view all sightings
5. **Case-Insensitive**: Searches work regardless of capitalization

### How to Use Search

1. **Type in the search box** above the sightings list
2. **Results filter instantly** as you type
3. **Use partial matches** - search for "Ram" to find "Ramstein Air Base"
4. **Search coordinates** - type "49.4" to find sightings near that latitude
5. **Search symbol codes** - type "SHAPMF" to find UAS Fixed Wing sightings
6. **Clear search** - click "Clear" to see all sightings again

## Auto-Fill Date/Time Feature

The application automatically populates the date and time field with the current date and time for convenience.

### Features

1. **Auto-Fill on Load**: Time field shows current date/time when page loads
2. **Auto-Fill on Reset**: After submitting a sighting, form resets with current time
3. **"Now" Button**: Quick button to reset time to current date/time
4. **Full Editability**: Users can still manually change the date/time as needed

### Benefits

- **Convenience**: Most sightings are reported at current time
- **Flexibility**: Easy to change for historical sightings
- **User Experience**: Reduces manual data entry

## Symbol Code Feature

The application includes automatic symbol code generation for UAS - Fixed Wing sightings, following military symbology standards.

### How It Works

1. **Auto-Population**: When "UAS - Fixed Wing" is selected from the dropdown, the symbol code field automatically populates with "SHAPMF--***"
2. **Auto-Clear**: When any other sighting type is selected, the symbol code field is cleared
3. **Read-Only Field**: The symbol code field is read-only to prevent manual editing
4. **Database Storage**: Symbol codes are stored in the database with each sighting
5. **Search Integration**: Symbol codes are included in the search functionality

### Symbol Code Details

- **Format**: SHAPMF--*** (Standard military symbology for UAS Fixed Wing)
- **Auto-Generated**: No manual input required
- **Consistent**: Ensures standardized symbol codes across all reports
- **Searchable**: Can be searched in the sightings list

## DateTime Formatting

The application features intelligent datetime handling with proper timezone support and consistent display formatting.

### Features

1. **Input Format**: HTML5 datetime-local input (YYYY-MM-DDTHH:MM)
2. **Storage Format**: PostgreSQL stores with timezone (TIMESTAMP WITH TIME ZONE)
3. **Display Format**: Consistent YYYY-MM-DDTHH:MM format in sightings list
4. **Timezone Handling**: Automatic conversion between local time and UTC
5. **Auto-Fill**: Current date/time populated on form load and reset

### How It Works

1. **Form Input**: Users select date/time using datetime-local picker
2. **API Conversion**: Frontend converts to ISO format for backend
3. **Database Storage**: PostgreSQL stores with full timezone information
4. **Display Formatting**: Frontend formats for consistent YYYY-MM-DDTHH:MM display
5. **Timezone Support**: Handles timezone conversions automatically

### Benefits

- **User-Friendly**: Easy datetime selection with native browser controls
- **Accurate Storage**: Full timezone information preserved in database
- **Consistent Display**: Clean, readable format in sightings list
- **Timezone Aware**: Proper handling of different timezones
- **Auto-Fill Convenience**: Reduces manual data entry

## pgAdmin Database Management

The application includes pgAdmin for easy database management and administration with **automatic connection** to your UAS Reporting database.

### Access Information

- **URL**: http://localhost:5050
- **Email**: admin@uasreporting.com
- **Password**: admin123

### Auto-Connect Features

✅ **Pre-configured Server**: "UAS Reporting Database" is automatically connected
✅ **No Manual Setup**: Database connection is ready immediately
✅ **Persistent Configuration**: Settings saved across container restarts
✅ **Same Credentials**: Uses your existing database credentials

### How to Use

1. **Open pgAdmin**: Go to http://localhost:5050
2. **Login**: Use admin@uasreporting.com / admin123
3. **Database Ready**: "UAS Reporting Database" appears in the left sidebar
4. **Expand Server**: Click to see your `uas_reporting` database and `uas_sightings` table

### Features

- **Visual Database Management**: Browse tables, views, and data
- **SQL Query Interface**: Run custom SQL queries
- **Data Export/Import**: Export data in various formats
- **Performance Monitoring**: Monitor database performance
- **Schema Management**: View and modify database structure
- **Auto-Connect**: No manual server configuration required

## Project Structure

```
uas-reporting-tool/
├── backend/
│   ├── __init__.py      # Python package init
│   ├── main.py          # FastAPI backend server
│   ├── database.py      # Database configuration
│   ├── models.py        # SQLAlchemy models
│   └── schemas.py       # Pydantic schemas
├── public/
│   └── index.html       # Main HTML file
├── src/
│   ├── App.js           # Main React component
│   ├── App.css          # Component styles
│   ├── index.js         # React entry point
│   └── index.css        # Global styles
├── Dockerfile           # Backend container definition
├── docker-compose.yml   # Multi-service orchestration
├── package.json         # Node.js dependencies
├── requirements.txt      # Python dependencies
├── pgadmin/             # pgAdmin configuration
│   └── servers.json     # Auto-connect server configuration
├── start.bat            # Windows startup script
├── stop.bat             # Windows stop script
├── cleanup.bat          # Windows cleanup script
└── README.md            # This file
```

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose

## Quick Start (Windows)

1. **Clean up any existing services (if needed):**
   ```bash
   cleanup.bat
   ```

2. **Start the application:**
   ```bash
   start.bat
   ```

3. **Stop the application:**
   ```bash
   stop.bat
   ```

## Manual Docker Setup

### Start All Services

```bash
docker-compose up --build
```

### Stop All Services

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

## Service Details

### PostgreSQL Database
- **Port**: 5432
- **Database**: uas_reporting
- **Username**: uas_user
- **Password**: uas_password
- **Data Persistence**: Docker volume `postgres_data`

### FastAPI Backend
- **Port**: 8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: Automatically connects to PostgreSQL
- **Auto-restart**: Enabled

### React Frontend
- **Port**: 3001 (changed from 3000 to avoid conflicts)
- **Hot Reload**: Enabled
- **API Calls**: Direct calls to backend using environment variables

### pgAdmin Database Management
- **Port**: 5050
- **Web Interface**: http://localhost:5050
- **Login**: admin@uasreporting.com / admin123
- **Database Access**: Full PostgreSQL management interface
- **Auto-Connect**: Pre-configured connection to UAS Reporting database
- **Data Persistence**: pgAdmin settings saved in Docker volume

## API Endpoints

- `GET /` - API information
- `GET /sightings` - Get all sightings (with pagination)
- `POST /sightings` - Create a new sighting
- `GET /sightings/{id}` - Get a specific sighting

## Database Schema

```sql
CREATE TABLE uas_sightings (
    id SERIAL PRIMARY KEY,
    type_of_sighting VARCHAR(255) NOT NULL,
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    symbol_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## Form Fields

1. **Type of Sighting**: Dropdown with options:
   - UAS - Fixed Wing
   - UAS - Rotary Wing
   - UAS - Small Commercial
   - UAS - Large Commercial
   - Manned - Fixed Wing
   - Manned - Rotary Wing

2. **Time**: DateTime picker with auto-fill features:
   - **Auto-fills** with current date/time on page load
   - **"Now" button** to quickly reset to current time
   - **Fully editable** for historical sightings
   - **Auto-resets** to current time after form submission

3. **Location**: Text input with geocoding search:
   - **Type any location** (e.g., "Pittsburgh, PA", "Ramstein Air Base")
   - **Search button** to trigger geocoding API
   - **Auto-populates coordinates** when location is found
   - **Updates location name** with full address from API
   - **Supports worldwide locations**

4. **Latitude**: Numeric input for GPS latitude coordinate:
   - **Auto-populated** from location search
   - **Auto-populated** from map clicks
   - **Manually editable** if needed

5. **Longitude**: Numeric input for GPS longitude coordinate:
   - **Auto-populated** from location search
   - **Auto-populated** from map clicks
   - **Manually editable** if needed

6. **Description**: Textarea for detailed description of the sighting

7. **Symbol Code**: Auto-populated field for military symbology:
   - **Auto-populates** with "SHAPMF--***" when "UAS - Fixed Wing" is selected
   - **Auto-clears** when any other sighting type is selected
   - **Read-only** to prevent manual editing
   - **Searchable** in the sightings list

## Styling

- **Background**: Black (#000000)
- **Text**: Yellow (#FFFF00)
- **Input boxes**: Light gray (#D3D3D3)
- **Responsive design** for mobile and desktop
- **Coordinates layout**: Side-by-side on desktop, stacked on mobile
- **Search functionality**: Integrated search bars with clear buttons
- **Interactive buttons**: Hover effects and visual feedback
- **Loading states**: Visual indicators during API calls
- **Form containers**: Organized input groups with proper spacing

## Development

### Making Changes
- **Backend**: Changes to Python files auto-reload
- **Frontend**: Changes to React files auto-reload
- **Database**: Schema changes require container restart

### Adding New Dependencies
1. **Python**: Add to `requirements.txt`, rebuild backend container
2. **Node.js**: Add to `package.json`, rebuild frontend container

### Database Migrations
For production use, consider adding Alembic for database migrations.

## Troubleshooting

### Common Issues

1. **Port already in use**: 
   - Run `cleanup.bat` first
   - Check if other services are using the ports
   - Frontend now runs on port 3001 to avoid conflicts

2. **Import errors in backend**: 
   - Fixed relative import issues
   - Backend now uses absolute imports

3. **Database connection failed**: 
   - Wait for PostgreSQL to fully start (health check)
   - Check Docker logs: `docker-compose logs postgres`

4. **Frontend proxy errors**: 
   - Ensure backend is running and healthy
   - Frontend now uses direct API calls instead of proxy

5. **Database schema changes**:
   - If you get database errors after schema updates, run:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

### Reset Everything
```bash
docker-compose down -v
docker-compose up --build
```

### Port Conflicts
If you get port conflicts:
1. Run `cleanup.bat` to stop existing services
2. Check what's using the ports with `netstat -ano | findstr :PORT`
3. Stop conflicting services
4. Run `start.bat` again

## License

This project is open source and available under the MIT License. 