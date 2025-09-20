# Testing Guide

## Step-by-Step Testing Instructions

### 1. Test Backend (Django)

**Terminal 1 - Start Django Backend:**

```bash
cd C:\Users\DELL\event-search-app\backend
venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 - Test Backend APIs:**

```bash
cd C:\Users\DELL\event-search-app
pip install requests
python test_backend.py
```

Expected output:

```
🚀 Starting backend tests...
🔍 Testing health check...
✅ Health check passed: {'status': 'healthy', 'message': 'Event search API is running'}
📁 Testing file upload...
✅ File upload successful: {'message': 'Processed 1 files', 'results': [...]}
🔍 Testing search...
✅ Search successful in 0.045s
   Found 1 events
   Backend search time: 0.012s
📊 Test Results: 3/3 tests passed
🎉 All tests passed! Backend is working correctly.
```

### 2. Test Frontend (React)

**Terminal 3 - Start React Frontend:**

```bash
cd C:\Users\DELL\event-search-app\frontend\event-search-frontend
npm start
```

Browser should open automatically at `http://localhost:3000`

### 3. Manual UI Testing

1. **Check Backend Connection:**

   - Look for green "Backend Online" badge in navbar
   - If red "Backend Offline", ensure Django server is running

2. **Test File Upload:**

   - Click "Choose Files" in Upload section
   - Select `sample_events.log` from project root
   - Click "Upload Files"
   - Should see success message with event count

3. **Test Search:**

   - Enter search criteria:
     - Source Address: `159.62.125.136`
     - Action: `REJECT`
   - Click "Search Events"
   - Should see results with search time

4. **Test Different Searches:**
   - Clear form and try: Account ID: `348935949`
   - Try: Protocol: `TCP (6)`
   - Try: Destination Address: `8.8.8.8`

### 4. Test Concurrent Requests

**Option A - Using curl (in PowerShell):**
waitress-serve --port=8000 --threads=8 event_search_backend.wsgi:application

```powershell
# Test 10 concurrent searches
1..10 | ForEach-Object -Parallel {
    $body = @{
        action = "ACCEPT"
        start_time = 1725850449
        end_time = 1725855086
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/search/" -Method POST -ContentType "application/json" -Body $body
    Write-Host "Request $_ completed in $($response.search_time)s"
}
```

**Option B - Using the UI:**

- Open multiple browser tabs to `http://localhost:3000`
- Perform searches simultaneously in different tabs
- Check that all searches complete successfully

### 5. Docker Testing (Optional)

**Build and run with Docker:**

```bash
cd C:\Users\DELL\event-search-app
docker-compose up --build
```

Access:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

### Expected Performance Benchmarks

| Test                       | Expected Time | Status |
| -------------------------- | ------------- | ------ |
| Health Check               | < 0.1s        | ✅     |
| File Upload (10 events)    | < 2s          | ✅     |
| Search (single criteria)   | < 0.1s        | ✅     |
| Search (multiple criteria) | < 0.2s        | ✅     |
| Concurrent 10 searches     | < 1s total    | ✅     |

### Troubleshooting

**Backend Issues:**

- ❌ `ModuleNotFoundError`: Run `pip install -r requirements.txt`
- ❌ `Port 8000 in use`: Change port or kill existing process
- ❌ `Database locked`: Restart Django server

**Frontend Issues:**

- ❌ `Backend Offline`: Ensure Django is running on port 8000
- ❌ `CORS errors`: Check Django CORS settings
- ❌ `npm errors`: Run `npm install` again

**File Upload Issues:**

- ❌ `Upload failed`: Check file format (pipe-delimited)
- ❌ `Permission denied`: Check file permissions

### Sample Test Data

Use `sample_events.log` for testing:

- 10 sample events
- Mix of ACCEPT/REJECT actions
- Various protocols (TCP, UDP, EGP)
- Different IP addresses and ports

### Success Criteria

✅ **Backend Tests Pass**: All 3 API tests successful
✅ **Frontend Loads**: React app loads without errors
✅ **File Upload Works**: Sample file uploads successfully  
✅ **Search Works**: Returns results with search time
✅ **UI Responsive**: All components render correctly
✅ **Concurrent Handling**: Multiple searches complete successfully
