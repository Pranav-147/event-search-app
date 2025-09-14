# Event Search Application

A Django + React application for uploading and searching through event log files with optimized performance for concurrent requests.

## Features

- 📁 **File Upload**: Upload multiple event log files (pipe-delimited format)
- 🔍 **Multi-field Search**: Search by IP addresses, ports, protocols, actions, time ranges
- ⚡ **Fast Performance**: Optimized database queries with proper indexing
- 🔢 **Concurrent Support**: Handles 10+ simultaneous search requests
- 📊 **Detailed Results**: Shows search time, file sources, and event details
- 🔒 **Input Validation**: Mandatory time fields and comprehensive validation
- 🎨 **Clean UI**: Simplified search results with detailed view on demand
- 🐳 **Docker Ready**: Easy deployment with Docker Compose

## Architecture

- **Backend**: Django REST Framework with SQLite (fastest for this use case)
- **Frontend**: React.js with Bootstrap UI
- **Database**: SQLite with optimized indexing for search performance

## Quick Start

### Option 1: Docker (Recommended)

1. **Clone and navigate to project**:
   ```bash
   cd event-search-app
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend/event-search-frontend
npm install
npm start
```

## Usage Guide

### 1. Upload Event Files
- Click "Choose Files" and select your event log files
- Supported formats: `.log`, `.txt`, `.csv` (pipe-delimited)
- Files should follow this format:
```
serialno|version|account-id|instance-id|srcaddr|dstaddr|srcport|dstport|protocol|packets|bytes|starttime|endtime|action|log-status
1|2|348935949|eni-293216456|159.62.125.136|30.55.177.194|152|23475|8|10|3929334|1725850449|1725855086|REJECT|OK
```

### 2. Search Events
⚠️ **Required Fields**: Start time, end time, and at least one search field are mandatory.

- **Required**: Start Time & End Time (epoch format)
  - Example: 1725850449, 1725855086
- **Required**: At least one search field:
  - **Account ID**: e.g., 348935949
  - **Source/Destination IP**: e.g., 159.62.125.136
  - **Source/Destination Port**: e.g., 152, 23475
  - **Protocol**: TCP (6), UDP (17), ICMP (1), etc.
  - **Action**: ACCEPT, REJECT

### 3. View Results
- **Clean Format**: `Event Found: 159.62.125.136 → 30.55.177.194 | Action: REJECT | Log Status: OK`
- **Performance Info**: Shows search time and source file
- **Detailed View**: Click "View" button to see all event fields
- **Pagination**: Results are paginated for better performance

## Database Performance Comparison

| Database | Read Speed | Concurrent Users | Setup Complexity | Best For |
|----------|------------|------------------|------------------|----------|
| **SQLite** | ⭐⭐⭐⭐⭐ | 10-20 | ⭐⭐⭐⭐⭐ | **This app** |
| **MySQL** | ⭐⭐⭐⭐ | 50+ | ⭐⭐⭐ | High concurrency |
| **MongoDB** | ⭐⭐ | 50+ | ⭐⭐ | Unstructured data |

**Recommendation**: SQLite is optimal for this event search application due to:
- No network overhead (embedded database)
- Excellent indexing for IP/port searches
- Perfect for read-heavy workloads
- Handles concurrent searches efficiently

## API Endpoints

- `POST /api/upload/` - Upload event files
- `POST /api/search/` - Search events (**requires start_time & end_time**)
- `GET /api/files/` - Get uploaded files list
- `GET /api/health/` - Health check

### Search API Requirements
```json
{
  "start_time": 1725850449,  // REQUIRED
  "end_time": 1725855086,    // REQUIRED
  "account_id": "348935949", // At least one search field required
  "srcaddr": "159.62.125.136",
  "action": "REJECT"
}
```

## Example Search Results Format

```json
{
  "events": [...],
  "total_count": 150,
  "search_time": 0.045,
  "files_searched": ["events_2025.log"]
}
```

## Testing Concurrent Requests

The application is optimized for concurrent searches. Test with tools like:

```bash
# Test concurrent searches
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/search/ \
    -H "Content-Type: application/json" \
    -d '{"srcaddr":"159.62.125.136"}' &
done
```

## MySQL Alternative

If you need MySQL for higher concurrency:

```bash
# Use MySQL compose file
docker-compose -f docker-compose.mysql.yml up --build
```

## Troubleshooting

1. **Backend connection error**: Ensure Django server is running on port 8000
2. **File upload fails**: Check file format (pipe-delimited) and permissions
3. **Slow searches**: Verify database indexes are created after migration
4. **Docker issues**: Try `docker-compose down -v` and rebuild

## Performance Notes

- SQLite performs best for this use case (search-heavy, moderate concurrency)
- Database indexes are optimized for common search patterns
- Results are limited to 1000 events per search for optimal response time
- File uploads are processed in batches for memory efficiency

## Development

- Backend: Django 4.2.7 + DRF 3.14.0
- Frontend: React 18 + Bootstrap 5
- Database: SQLite with custom indexes
- Containerization: Docker + Docker Compose
