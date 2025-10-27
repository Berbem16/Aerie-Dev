# AERIE - UAS Reporting Tool

A modern, dashboard-style web application for reporting UAS (Unmanned Aerial System) sightings with a React frontend, FastAPI backend, and PostgreSQL database. Features a professional military-style interface with comprehensive unit tracking and advanced search capabilities.

## Features

### Core Functionality
- **Dashboard Interface**: Modern left sidebar navigation with AERIE branding
- **Unit-Based Reporting**: Complete Army Service Component Command (ASCC) and unit selection
- **Interactive Map**: Visual coordinate selection with two-way geocoding
- **Advanced Search**: Multi-criteria search including time, location, and unit filters
- **Real-Time Dashboard**: Live statistics showing total sightings and pending reports
- **Professional UI**: Dark theme with yellow accents and military styling

### Technical Features
- **PostgreSQL Database**: Persistent data storage with unit tracking
- **Fully Containerized**: Docker-based deployment with pgAdmin integration
- **Geocoding Integration**: Multi-API location search with worldwide coverage
- **Symbol Code Generation**: Automatic military symbology for all aircraft types
- **Image Upload**: Support for multiple photo attachments
- **Responsive Design**: Works on desktop and mobile devices
- **Real-Time Updates**: Live dashboard statistics and form validation
- **Browser Storage**: AI chat history and form data persisted locally

### New Features (Latest Updates)
- **🆕 Dashboard Redesign**: Left sidebar navigation with AERIE branding
- **🆕 Unit Selection Workflow**: ASCC and unit selection modal for all submissions
- **🆕 Complete Unit Database**: All 9 ASCCs with their respective units populated
- **🆕 Enhanced Search**: Search by unit, ASCC, time, location, and more
- **🆕 Dashboard Cards**: Real-time statistics for total sightings and pending reports
- **🆕 Professional Styling**: Military-grade UI with dark theme and yellow accents
- **🆕 AI Integration**: Custom AI icon in sidebar footer
- **🆕 Advanced Search**: Multi-criteria backend search with location radius and unit filtering
- **🆕 Admin Panel**: Complete user management and database monitoring system
- **🆕 Dynamic Page Titles**: Context-aware header titles that update with navigation
- **🆕 User Management**: Add, edit, delete users with role-based permissions
- **🆕 Database Manager**: Real-time PostgreSQL table monitoring and schema display
- **🆕 AI Analysis Integration**: Live LLM chat interface powered by Cerebras API
- **🆕 Persistent Chat History**: AI conversation saved to browser storage for continuity across sessions
- **🆕 Development Timeline**: Visual progress tracking for AI feature development
- **🆕 Word Document Export**: Professional military-grade Word document generation for saved forms
- **🆕 Enhanced Form Saving**: Local storage with professional document output
- **🆕 Map Visualization Tab**: Dedicated map view with military symbol display and interactive search
- **🆕 Military Symbol Integration**: Automatic rendering of MIL-STD-2525 symbols on map markers
- **🆕 Circle Search Functionality**: Draw circles on map to search for sightings within radius
- **🆕 Interactive Symbol Popups**: Click any symbol on map to view detailed sighting information
- **🆕 Sightings Management**: Admin panel tab to view and delete any sighting from database
- **🆕 Real-Time AI Chat**: Conversational AI assistant for UAS sighting analysis and intelligence
- **🆕 Clear Chat Button**: Easily reset conversation history with confirmation dialog

### Recent Bug Fixes
- **🔧 Fixed Analysis Tab**: Resolved missing FaRobot icon import error that was preventing the Analysis tab from loading
- **🔧 Fixed Unit Search**: Improved unit search functionality with proper empty string handling and parameter normalization
- **🔧 Enhanced Error Handling**: Added comprehensive logging and error handling to backend search endpoints
- **🔧 Parameter Validation**: Normalized empty strings to prevent validation errors in search queries
- **🔧 Improved Stability**: Better error handling for edge cases in search functionality

## Dashboard Interface

AERIE features a modern, professional dashboard interface designed for military operations with a clean, intuitive layout.

### Navigation Structure
- **Left Sidebar**: Fixed navigation with AERIE branding and star icon
- **Main Content Area**: Dynamic content area with header and page content
- **Tab Navigation**: Easy switching between Report and Sightings pages
- **Professional Styling**: Dark theme with yellow accents and military-grade aesthetics

### Dashboard Cards
Real-time statistics displayed at the top of the Report page:
- **Total Sightings**: Live count of all reported sightings from the database
- **Pending Report**: Shows "1" when form has unsaved data, "0" when empty
- **Saved Forms**: Count of forms saved locally with Word document generation
- **Auto-Updates**: Statistics refresh automatically after form submissions and saves

### Navigation Tabs
- **REPORT**: Main sighting submission form with interactive map
- **SIGHTINGS**: Advanced search and viewing of all reported sightings
- **MAP**: Interactive map visualization with military symbols and circle search functionality
- **ANALYSIS**: AI-powered chat interface with live Cerebras LLM integration
- **ADMIN**: Complete administrative panel with user, sightings, and database management

## Unit Selection Workflow

The application now includes a comprehensive unit selection system that captures Army Service Component Command (ASCC) and specific unit information for all sightings.

### Workflow Process
1. **Fill out sighting form** on the main Report page
2. **Click Submit** → Unit selection modal appears
3. **Select ASCC** → Choose from 9 Army Service Component Commands
4. **Select Unit** → Choose from units specific to the selected ASCC
5. **Click Continue** → Form submits with unit information
6. **Success** → Form resets and modal closes

### Available ASCCs and Units

#### ARCYBER (1 unit)
- NETCOM

#### SDDC (5 units)
- 595th Transportation BDE
- 596th Transportation BDE
- 597th Transportation BDE
- 598th Transportation BDE
- 599th Transportation BDE

#### USARCENT (7 units)
- TF Spartan
- 1st TSC
- 160th Signal BDE
- ASG - Kuwait
- 4th BN Coordination Detachment
- ASG - Jordan
- 513th MIB

#### USAREUR-AF (10 units)
- V Corps
- 56th Artillery Command
- 7th Army Training Command
- 10th Army Air & Missile Defense Command
- 21st Theater Sustainment Command
- Southern European Task Force – Africa
- Headquarters & Headquarters Battalion
- U.S. Army Europe and Africa Band and Chorus
- U.S. Army NATO Brigade
- 68th Medical Command

#### USARNORTH (3 units)
- CSTA
- TF 51
- DCE

#### USARPAC (19 units)
- 8th Army, I Corps, 25th ID, 11th ABN DIV, 94th AMDC, 8th TSC, 7th ID, 2nd ID, 5th SFAB, 1st MDTF, 3rd MDTF, 196th Infantry Brigade, 18th MEDCOM, 311th Signal Command, USAR-J, 351st Civil Affairs Command, 9th MSC, 5th Battlefield Coordination Detachment, 500th MI BDE

#### USARSOUTH (4 units)
- 470th MIB
- 56th Signal BN
- 1st BN
- 228th Aviation Regiment

#### USASMDC (3 units)
- 100th Missile Defense Brigade
- 1st Space Brigade
- SMDCOE

#### USASOC (12 units)
- 1st Special Forces Command, 1st SFG, 3rd SFG, 5th SFG, 7th SFG, 10th SFG, 19th SFG, 20th SFG, 4th POG, 8th POG, 95th Civil Affairs Brigade, 528th Sustainment Brigade, Special Operations

### Technical Implementation
- **Dynamic Dropdowns**: Unit list updates based on ASCC selection
- **Database Integration**: Unit data stored in PostgreSQL with sightings
- **Search Integration**: Units are searchable in the Recent Sightings page
- **Form Validation**: Both ASCC and unit must be selected to continue

## Word Document Export

The application includes professional Word document generation for saved forms, providing military-grade documentation suitable for official reporting and archiving.

### Save Form Options

After selecting ASCC and Unit, users have two options:

#### **Save Form Button**
- **Local Storage**: Saves form data to browser's localStorage for persistence
- **Word Document**: Generates and downloads a professional Word document
- **Professional Format**: Military-grade document with official styling
- **Complete Data**: All form fields included in structured format

#### **Continue Button**
- **Database Submission**: Submits form directly to PostgreSQL database
- **Real-time Processing**: Immediate data storage and processing
- **Dashboard Updates**: Live statistics refresh after submission

### Word Document Features

#### **Professional Formatting**
- **Military Header**: "AERIE UAS REPORTING SYSTEM" branding
- **Classification Banner**: "UNCLASSIFIED//FOR OFFICIAL USE ONLY"
- **Times New Roman Font**: Professional serif font for official documents
- **Standard Margins**: 1-inch margins for proper document formatting

#### **Document Structure**
1. **Classification Header**: Official security classification
2. **Document Header**: AERIE system branding and report title
3. **Reporting Information**: ASCC, Unit, Symbol Code, Report Date
4. **Sighting Details**: Type, Time, Location, Coordinates
5. **Description Section**: Full incident description in bordered text box
6. **Attached Images**: Image count and reference information
7. **Footer**: System information, Report ID, and generation timestamp

#### **Professional Styling**
- **Section Headers**: Bold, underlined section titles
- **Form Fields**: Labeled fields with underlined values
- **Two-Column Layout**: Efficient space utilization
- **Bordered Description**: Professional text box for descriptions
- **Consistent Spacing**: Proper margins and line spacing

### File Management

#### **File Generation**
- **Format**: Microsoft Word document (.doc)
- **Naming Convention**: `UAS_Sighting_Report_YYYY-MM-DD.doc`
- **MIME Type**: `application/msword` for proper Word recognition
- **Download**: Automatic download to user's device

#### **Local Storage**
- **Browser Persistence**: Forms saved across browser sessions
- **Dashboard Integration**: Saved forms count displayed in dashboard
- **Data Structure**: JSON format for easy retrieval and processing
- **Error Handling**: Graceful handling of storage limitations

### Use Cases

#### **Official Reporting**
- **Military Documentation**: Suitable for official UAS sighting reports
- **Chain of Command**: Professional format for command reporting
- **Archival**: Long-term storage and reference documentation

#### **Offline Capability**
- **Local Storage**: Forms available without internet connection
- **Document Generation**: Professional documents created locally
- **Data Portability**: Easy sharing and distribution of reports

## Admin Panel

The Admin panel provides comprehensive system administration capabilities with user management, sightings management, and database monitoring tools.

### User Management
- **Add New Users**: Create user accounts with username, email, role, and password
- **Role Management**: Assign roles (User, Analyst, Admin) with color-coded badges
- **Edit Users**: Modify existing user information and roles
- **Delete Users**: Remove user accounts from the system
- **User Table**: View all users with creation dates and role assignments

### Sightings Management
- **View All Sightings**: Complete list of all reported UAS sightings in the system
- **Sighting Details**: Display type, location, time, unit, and other key information
- **Delete Sightings**: Remove sightings from the database with confirmation dialog
- **Real-Time Count**: See total number of sightings in the system
- **Quick Management**: Efficient interface for managing all sighting records

### Database Manager
- **Table Overview**: View all PostgreSQL tables with row counts and storage sizes
- **Schema Display**: Complete column information including data types and constraints
- **Table Statistics**: Real-time database metrics and storage information
- **Column Details**: Detailed view of table structures with nullable constraints

### Admin Features
- **Tabbed Interface**: Clean navigation between User, Sightings, and Database Management
- **Professional Styling**: Consistent with AERIE dashboard theme
- **Real-time Updates**: Live data display and management capabilities
- **Role-based Access**: Different permission levels for different user types

### Database Tables Monitored
- **uas_sightings**: Main sightings table with 13 columns including unit tracking
- **users**: User management table with authentication and role information
- **Column Information**: Complete schema details for all database tables

## AI-Powered Analysis

The Analysis tab provides a live AI-powered chat interface powered by the Cerebras Cloud SDK, enabling real-time conversational analysis of UAS sighting data using Large Language Models.

### Current Features

#### Interactive Chat Interface
- **Live AI Chat**: Real-time conversation with LLM-powered assistant
- **Streaming Responses**: AI responses stream in progressively for natural interaction
- **Conversational Analysis**: Ask questions about UAS sightings, patterns, and threats
- **Intelligent Insights**: AI generates actionable intelligence and recommendations
- **Natural Language**: Ask questions in plain English
- **Persistent History**: Full conversation automatically saved to browser storage
- **Session Continuity**: Chat history preserved across page refreshes and navigation
- **Clear Conversation**: Reset chat history with confirmation dialog when needed

#### Integration Details
- **Cerebras Cloud SDK**: Powered by Cerebras Cloud API (cerebras-cloud-sdk v1.56.1)
- **Model**: qwen-3-235b-a22b-instruct-2507
- **Streaming Responses**: Server-Sent Events (SSE) for real-time updates
- **High Token Limit**: Up to 20,000 completion tokens per response
- **Configurable Parameters**: Temperature, top_p, and max tokens adjustable
- **Professional UI**: Chat interface with user and AI message distinction

#### Use Cases
- **Pattern Analysis**: Ask AI to identify sighting patterns and trends
- **Threat Assessment**: Request intelligence analysis of recent sightings
- **Strategic Recommendations**: Get AI-powered operational insights
- **Data Exploration**: Query and analyze sighting data in natural language
- **Report Generation**: Request AI-generated intelligence summaries

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

The application includes powerful search capabilities for finding and filtering sightings with both frontend and backend search options.

### Frontend Search (Real-Time)
Search across all sighting data with instant filtering:
- **Location names** (e.g., "Ramstein", "Pittsburgh")
- **Coordinates** (e.g., "49.4521", "40.4406")
- **Sighting types** (e.g., "UAS", "Fixed Wing")
- **Descriptions** (any text content)
- **Symbol codes** (e.g., "SHAPMF--***")
- **ASCC** (e.g., "USAREUR-AF", "USASOC")
- **Unit** (e.g., "21st TSC", "5th SFG")

### Backend Search (Advanced Filters)
Use the Advanced Search section for complex queries:

#### Time Window Search
- **Start Time**: Beginning of time range
- **End Time**: End of time range
- **Combined**: Find sightings within specific time periods

#### Location Search
- **Location**: MGRS coordinates or location name
- **Radius**: Search radius in kilometers
- **Combined**: Find sightings within radius of specific coordinates

#### Unit Search
- **Unit**: Search by specific unit name
- **Partial Matching**: Find units containing search term
- **Combined**: Use with time and location filters

### Search Examples

#### Frontend Search
- Type "21st TSC" → Shows all sightings from 21st Theater Sustainment Command
- Type "USASOC" → Shows all sightings from Special Operations Command
- Type "49.4" → Shows sightings near that latitude
- Type "UAS" → Shows all UAS-related sightings

#### Backend Search
- **Time + Unit**: Find sightings from "5th SFG" in the last week
- **Location + Unit**: Find sightings within 10km of coordinates from "1st TSC"
- **All Filters**: Time window + location radius + specific unit
- **Unit Only**: Search for "21st TSC" → Shows all sightings from that unit

## Map Visualization

The Map tab provides an interactive visualization of UAS sightings using military symbols, enabling geographic analysis and spatial intelligence.

### Key Features

#### Military Symbol Display
- **MIL-STD-2525 Symbols**: All sightings displayed as standard military symbols using milsymbol library
- **Automatic Rendering**: Symbol codes from database converted to visual markers
- **Professional Markers**: Military-grade symbology instead of generic map pins
- **Standard Compliant**: Symbols follow NATO and US military standards

#### Interactive Symbol Popups
- **Click to View**: Click any symbol to see detailed sighting information
- **Complete Details**: Type, time, location, unit, and description displayed
- **Visual Feedback**: Symbols highlight when clicked
- **Context-Aware**: Popup shows full sighting context

#### Circle Search Functionality
- **Draw Circles**: Use the circle drawing tool to select areas on the map
- **Radius-Based Search**: Automatic search for sightings within drawn circle
- **Visual Feedback**: Yellow circle overlay shows search area
- **Real-Time Results**: Markers update instantly based on search
- **Clear Search**: Button to reset and show all sightings

#### Map Features
- **Full-Screen Display**: Map takes up entire available space for maximum visibility
- **Zoom & Pan**: Standard map controls for detailed exploration
- **OpenStreetMap Tiles**: High-quality worldwide map rendering
- **Responsive Design**: Adapts to different screen sizes

### How to Use the Map

1. **Navigate to Map Tab**: Click "MAP" in the left sidebar
2. **View All Sightings**: All sightings displayed as military symbols automatically
3. **Click Symbols**: Click any symbol to view details in a popup
4. **Draw Circle to Search**: Use the circle tool in top-right to search specific areas
5. **Clear Search**: Click "Clear Search" button when shown to reset
6. **Zoom and Pan**: Navigate the map to explore different regions

### Benefits
- **Visual Intelligence**: See geographic patterns and clustering of sightings
- **Military Symbols**: Professional symbology for standard compliance
- **Spatial Analysis**: Understand the geographic distribution of UAS activity
- **Interactive Exploration**: Click symbols to investigate specific incidents
- **Area-Specific Search**: Draw circles to focus on specific geographic regions

### How to Use Advanced Search

1. **Fill out search criteria** (any combination):
   - Time window (start/end times)
   - Location (MGRS + radius)
   - Unit name

2. **Click "Run Search"** → Backend processes all filters

3. **Results displayed** with success message showing which filters were applied

4. **Clear individual filters** or reset all filters

### Search Features
- **Real-Time Filtering**: Frontend search updates instantly as you type
- **Backend Processing**: Advanced search uses database queries for complex filters
- **Results Counter**: Shows number of matching sightings
- **Clear Options**: Clear individual filters or reset all
- **Case-Insensitive**: All searches work regardless of capitalization
- **Partial Matching**: Find results with partial text matches

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

The application includes automatic symbol code generation for all aircraft types (UAS and Manned), following military symbology standards.

### How It Works

1. **Auto-Population**: When any aircraft type is selected from the dropdown, the symbol code field automatically populates with the appropriate code:
   - **UAS - Fixed Wing**: `SHGPUCVUF-`
   - **UAS - Rotary Wing**: `SHGPUCVUR-`
   - **UAS - Small Commercial**: `SNGPUCVU--`
   - **UAS - Large Commercial**: `SNGPUCVU--`
   - **Manned - Fixed Wing**: `SHGPUCVF--`
   - **Manned - Rotary Wing**: `SHGPUCVF--`
2. **Auto-Clear**: When no aircraft type is selected, the symbol code field is cleared
3. **Read-Only Field**: The symbol code field is read-only to prevent manual editing
4. **Database Storage**: Symbol codes are stored in the database with each sighting
5. **Search Integration**: Symbol codes are included in the search functionality

### Symbol Code Details

- **UAS Fixed Wing**: `SHGPUCVUF-` (Standard military symbology for UAS Fixed Wing)
- **UAS Rotary Wing**: `SHGPUCVUR-` (Standard military symbology for UAS Rotary Wing)
- **UAS Commercial**: `SNGPUCVU--` (Standard military symbology for UAS Commercial)
- **Manned Aircraft**: `SHGPUCVF--` (Standard military symbology for Manned Fixed/Rotary Wing)
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
│   ├── main.py          # FastAPI backend server with search endpoints and LLM integration
│   ├── database.py      # Database configuration
│   ├── models.py        # SQLAlchemy models (includes unit fields)
│   ├── schemas.py       # Pydantic schemas (includes unit validation)
│   ├── searches.py      # Search utility functions
│   └── uploads.py       # Image upload handling
├── public/
│   ├── index.html       # Main HTML file
│   └── ai-icon.svg      # Custom AI icon for sidebar
├── src/
│   ├── App.js           # Main React component with routing
│   ├── App.css          # Component styles (dashboard theme)
│   ├── index.js         # React entry point
│   ├── index.css        # Global styles
│   ├── Home.js          # Main reporting form component with Word document export
│   ├── RecentSightings.js # Sightings list and search component
│   ├── Map.js           # Interactive map with military symbols and circle search
│   ├── Analysis.js      # AI-powered chat interface with live Cerebras integration
│   ├── Admin.js         # Administrative panel with user, sightings, and database management
│   ├── TabNavigation.js # Left sidebar navigation component
│   ├── Header.js        # Main header component with dynamic page titles
│   └── UnitSelectionModal.js # Unit selection modal component
├── Dockerfile           # Backend container definition
├── docker-compose.yml   # Multi-service orchestration (includes CEREBRAS_API_KEY)
├── package.json         # Node.js dependencies (includes react-router-dom, react-icons, leaflet, milsymbol)
├── requirements.txt     # Python dependencies (includes cerebras-cloud-sdk)
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
- **Logging**: Enhanced logging for search operations and error tracking
- **Error Handling**: Comprehensive error handling with detailed logging
- **LLM Integration**: Live Cerebras Cloud SDK integration for AI chat
- **Environment**: CEREBRAS_API_KEY configured for AI functionality

### React Frontend
- **Port**: 3001 (changed from 3000 to avoid conflicts)
- **Hot Reload**: Enabled
- **API Calls**: Direct calls to backend using environment variables
- **Mapping**: Interactive Leaflet map with draw tools and military symbols
- **AI Chat**: Real-time LLM chat interface with streaming responses
- **Military Symbols**: MIL-STD-2525 symbols rendered with milsymbol library

### pgAdmin Database Management
- **Port**: 5050
- **Web Interface**: http://localhost:5050
- **Login**: admin@uasreporting.com / admin123
- **Database Access**: Full PostgreSQL management interface
- **Auto-Connect**: Pre-configured connection to UAS Reporting database
- **Data Persistence**: pgAdmin settings saved in Docker volume

## API Endpoints

### Core Endpoints
- `GET /` - API information
- `GET /sightings` - Get all sightings (with pagination)
- `POST /sightings` - Create a new sighting (includes unit data)
- `GET /sightings/{id}` - Get a specific sighting
- `DELETE /sightings/{id}` - Delete a specific sighting

### LLM Endpoints
- `POST /llm/chat` - Chat with AI assistant (streaming):
  - `messages` - Conversation history array
  - `model` - Model name (default: qwen-3-235b-a22b-instruct-2507)
  - `temperature` - Response creativity (default: 0.7)
  - `top_p` - Nucleus sampling (default: 0.8)
  - `max_completion_tokens` - Maximum tokens (default: 20000)

### Search Endpoints
- `GET /sightings/search` - Advanced search with multiple filters:
  - `start_time` - Start of time range (ISO format)
  - `end_time` - End of time range (ISO format)
  - `latitude` - Center latitude for proximity search
  - `longitude` - Center longitude for proximity search
  - `radius_km` - Search radius in kilometers
  - `unit` - Search by unit name (partial matching)

- `GET /sightings/search/mgrs` - MGRS-based location search:
  - `mgrs` - MGRS coordinate string
  - `radius_km` - Search radius in kilometers
  - `start_time` - Optional time range start
  - `end_time` - Optional time range end

### Upload Endpoints
- `POST /upload` - Upload images for sightings
- `GET /uploads/{filename}` - Retrieve uploaded images

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
    ascc VARCHAR(100),                    -- Army Service Component Command
    unit VARCHAR(100),                    -- Specific unit within ASCC
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    image_urls JSONB DEFAULT '[]'::jsonb  -- Array of image URLs
);
```

### Database Features
- **Unit Tracking**: ASCC and unit columns for complete unit identification
- **Image Storage**: JSONB array for multiple image URLs per sighting
- **Timezone Support**: Full timezone information for all timestamps
- **Search Optimization**: Indexed columns for fast unit and location searches
- **Data Integrity**: Foreign key constraints and validation rules

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
   - **Auto-populates** with appropriate code when aircraft types are selected:
     - UAS - Fixed Wing: `SHGPUCVUF-`
     - UAS - Rotary Wing: `SHGPUCVUR-`
     - UAS - Small/Large Commercial: `SNGPUCVU--`
     - Manned - Fixed/Rotary Wing: `SHGPUCVF--`
   - **Auto-clears** when no aircraft type is selected
   - **Read-only** to prevent manual editing
   - **Searchable** in the sightings list

## Complete Workflow

### Reporting a Sighting
1. **Navigate to Report tab** (default page)
2. **Fill out sighting form**:
   - Select aircraft type (auto-populates symbol code)
   - Set date/time (auto-fills with current time)
   - Search location or click on map for coordinates
   - Add description and upload photos
3. **Click Submit** → Unit selection modal appears
4. **Select ASCC** → Choose from 9 Army Service Component Commands
5. **Select Unit** → Choose from units specific to the selected ASCC
6. **Choose Action**:
   - **Save Form** → Generates Word document and saves locally
   - **Continue** → Submits form to database
7. **Success** → Form resets, modal closes, dashboard updates

### Searching Sightings
1. **Navigate to Sightings tab**
2. **Use frontend search** for quick filtering:
   - Type in search box for real-time results
   - Search by location, coordinates, type, description, symbol code, ASCC, or unit
3. **Use advanced search** for complex queries:
   - Set time window (start/end times)
   - Set location with radius (MGRS coordinates)
   - Search by specific unit
   - Combine multiple filters
4. **Click "Run Search"** → Backend processes filters
5. **View results** with success message showing applied filters

### Map Visualization
1. **Navigate to Map tab**
2. **View All Sightings**:
   - See all sightings displayed as military symbols on the map
   - Symbols automatically rendered from symbol codes in database
   - Full-screen map for maximum visibility
3. **Explore Sightings**:
   - Click any military symbol to view detailed information
   - Popup shows type, time, location, unit, and description
4. **Search by Area**:
   - Use circle drawing tool in top-right of map
   - Draw circle around area of interest
   - View only sightings within that radius
5. **Clear Search**: Click "Clear Search" button to reset to all sightings

### AI Analysis Chat
1. **Navigate to Analysis tab**
2. **Start Conversation**:
   - Chat interface ready for natural language queries
   - Previous conversations automatically loaded
   - Ask questions about UAS sightings, patterns, or threats
3. **Ask Questions**:
   - "Analyze recent sighting patterns"
   - "What are the high-risk areas?"
   - "Provide intelligence report on UAS activity"
4. **View Responses**:
   - AI responses stream in real-time
   - Full conversation history maintained
   - Responses include actionable intelligence
5. **Continue Conversation**:
   - Follow up with related questions
   - Build on previous responses
   - Get increasingly detailed insights
6. **Persistent Storage**:
   - All conversations automatically saved
   - History preserved across browser sessions
   - Clear chat button to reset when needed

### Admin Panel Management
1. **Navigate to Admin tab**
2. **User Management**:
   - Add new users with username, email, role, and password
   - Edit existing user information and roles
   - Delete user accounts
   - View all users with role assignments and creation dates
3. **Sightings Management**:
   - View all UAS sightings in system
   - See total count of sightings
   - Delete any sighting with confirmation dialog
   - Manage sighting database entries
4. **Database Manager**:
   - View PostgreSQL table statistics and storage information
   - Monitor database schema and column details
   - Track table row counts and data types
   - Review database structure and constraints

## Styling

### Dashboard Theme
- **Background**: Black (#000000) with dark gray (#1a1a1a) accents
- **Primary Text**: Light gray (#E0E0E0) for readability
- **Accent Color**: Yellow (#FFFF00) for highlights and branding
- **Input Fields**: Dark gray (#2d2d2d) with light gray (#D3D3D3) text
- **Professional Layout**: Left sidebar navigation with main content area

### Component Styling
- **Sidebar**: Fixed left navigation with AERIE branding and star icon
- **Dashboard Cards**: Dark gray cards with yellow accents for statistics
- **Modal Design**: Professional modal with dark theme for unit selection
- **Form Layout**: Organized input groups with proper spacing and validation
- **Interactive Elements**: Hover effects and visual feedback throughout
- **Responsive Design**: Adapts to mobile and desktop screen sizes

### Visual Features
- **AI Icon**: Custom octagonal AI icon in sidebar footer
- **Navigation Icons**: React Icons for professional appearance
- **Loading States**: Visual indicators during API calls
- **Search Interface**: Integrated search bars with clear buttons
- **Map Integration**: Interactive map with coordinate selection
- **Image Display**: Thumbnail previews for uploaded photos
- **Dynamic Headers**: Context-aware page titles that update with navigation
- **Admin Interface**: Professional tabbed interface for system management
- **Role Badges**: Color-coded user role indicators (Admin=Red, Analyst=Yellow, User=Green)
- **Database Cards**: Clean table display with statistics and schema information
- **AI Analysis Interface**: Professional placeholder with gradient cards and feature previews
- **Development Timeline**: Visual progress tracking with animated status indicators
- **Feature Cards**: Interactive hover effects and professional AI feature presentation
- **Word Document Export**: Professional military-grade document generation with official styling
- **Save Form Interface**: Enhanced modal with dual action buttons (Save Form vs Continue)

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

6. **Analysis tab not loading**:
   - Fixed in latest update (missing icon import)
   - If issue persists, restart the frontend container
   - Check browser console for any import errors

7. **Unit search returning 422 error**:
   - Fixed in latest update (empty string handling)
   - Ensure you're entering a valid unit name
   - Check backend logs for detailed error messages
   - Restart backend service if issues persist

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