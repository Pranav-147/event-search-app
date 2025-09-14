# 🔄 API Changes: Mandatory Time Fields

## Overview
The event search API now requires **start_time** and **end_time** for all search requests to ensure efficient database queries and prevent unlimited searches.

## ⚠️ Breaking Changes

### Previous API (Optional Time Fields)
```json
// ❌ This was previously allowed but is now REJECTED:
{
  "account_id": "348935949",
  "action": "REJECT"
  // Missing start_time and end_time
}
```

### New API (Required Time Fields)
```json
// ✅ Now REQUIRED format:
{
  "account_id": "348935949", 
  "action": "REJECT",
  "start_time": 1725850449,  // REQUIRED: Start time in epoch format
  "end_time": 1725855086     // REQUIRED: End time in epoch format
}
```

## 🚨 Error Responses

### Missing Time Fields
```json
// Request without start_time or end_time:
{
  "account_id": "348935949"
}

// Response (400 Bad Request):
{
  "start_time": ["This field is required."],
  "end_time": ["This field is required."]
}
```

### Invalid Time Range
```json
// Request with start_time >= end_time:
{
  "account_id": "348935949",
  "start_time": 1725855086,  // Later time
  "end_time": 1725850449     // Earlier time  
}

// Response (400 Bad Request):
{
  "time_range": ["Start time must be before end time"]
}
```

### No Search Criteria
```json
// Request with only time range:
{
  "start_time": 1725850449,
  "end_time": 1725855086
}

// Response (400 Bad Request):
{
  "search_criteria": ["At least one search parameter must be provided (account_id, srcaddr, dstaddr, etc.)"]
}
```

## ✅ Valid Search Examples

### Single Field Search
```json
POST /api/search/
{
  "account_id": "348935949",
  "start_time": 1725850449,
  "end_time": 1725855086
}
```

### Multiple Field Search  
```json
POST /api/search/
{
  "srcaddr": "159.62.125.136",
  "action": "REJECT", 
  "protocol": 8,
  "start_time": 1725850449,
  "end_time": 1725855086
}
```

### IP Address Search
```json
POST /api/search/
{
  "srcaddr": "159.62.125.136",
  "start_time": 1725850449,
  "end_time": 1725855086
}
```

## 📅 Time Range Examples

### Sample Data Time Range
```json
{
  "start_time": 1725850449,  // Sep 8, 2024 20:54:09 GMT
  "end_time": 1725855095     // Sep 8, 2024 22:11:35 GMT
}
```

### Recent Time Range (Last 24 Hours)
```javascript
const now = Math.floor(Date.now() / 1000);
const yesterday = now - (24 * 60 * 60);

{
  "start_time": yesterday,
  "end_time": now
}
```

## 🎯 Benefits of Mandatory Time Fields

1. **Performance**: Prevents full table scans on large datasets
2. **Resource Management**: Limits query scope and memory usage  
3. **Concurrent Handling**: Enables better handling of 10+ simultaneous requests
4. **Data Integrity**: Ensures meaningful search results within specified time bounds

## 🔧 Frontend Changes

The React frontend now includes:
- **Required field indicators**: Red asterisks (*) on time fields
- **Validation messages**: Clear error messages for missing time fields
- **Real-time validation**: Form validation before sending request
- **Simplified Results UI**: Clean, readable format for search results

## 🎨 Simplified Results Display

Search results now show in a clean, easy-to-read format:

```
Event Found: 159.62.125.136 → 30.55.177.194 | Action: REJECT | Log Status: OK
File: events_2025.log | Search Time: 0.52 seconds
[View] <-- Button to see all details
```

**Benefits of the new UI:**
- **Cleaner display**: Less cluttered, easier to scan
- **Essential info first**: Source → Destination, Action, Status immediately visible
- **Detailed view on demand**: Click "View" button to see all fields
- **Performance info**: Search time and source file clearly shown

## 🧪 Testing the Changes

Use the test script to validate the new requirements:
```bash
cd backend
python test_search_requirements.py
```

Expected output: All 6 tests should PASS ✅

## 📊 Migration Impact

**For existing API clients:**
- ⚠️ **Breaking Change**: All search requests must include start_time and end_time
- 🔄 **Update Required**: Modify API calls to include time parameters  
- ✅ **Benefit**: Improved performance and more predictable response times
