#!/usr/bin/env python3
"""
Simple test script to verify backend functionality
"""
import requests
import json
import time

# Backend URL
BASE_URL = "http://localhost:8000/api"

def test_health_check():
    """Test health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health/")
        if response.status_code == 200:
            print("✅ Health check passed:", response.json())
            return True
        else:
            print("❌ Health check failed:", response.status_code)
            return False
    except Exception as e:
        print("❌ Health check error:", str(e))
        return False

def test_file_upload():
    """Test file upload endpoint"""
    print("\n📁 Testing file upload...")
    
    # Create a simple test file content
    test_content = """serialno|version|account_id|instance_id|srcaddr|dstaddr|srcport|dstport|protocol|packets|bytes|starttime|endtime|action|log_status
1|2|348935949|eni-293216456|159.62.125.136|30.55.177.194|152|23475|8|10|3929334|1725850449|1725855086|REJECT|OK
2|2|348935949|eni-293216456|30.55.177.194|159.62.125.136|23475|152|8|15|5847501|1725850450|1725855087|ACCEPT|OK"""
    
    try:
        # Create a temporary file-like object
        files = {'files': ('test_events.log', test_content, 'text/plain')}
        
        response = requests.post(f"{BASE_URL}/upload/", files=files)
        if response.status_code == 200:
            result = response.json()
            print("✅ File upload successful:", result)
            return True
        else:
            print("❌ File upload failed:", response.status_code, response.text)
            return False
    except Exception as e:
        print("❌ File upload error:", str(e))
        return False

def test_search():
    """Test search endpoint"""
    print("\n🔍 Testing search...")
    
    search_data = {
        "srcaddr": "159.62.125.136"
    }
    
    try:
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/search/", 
            json=search_data,
            headers={'Content-Type': 'application/json'}
        )
        search_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Search successful in {search_time:.3f}s")
            print(f"   Found {result.get('total_count', 0)} events")
            print(f"   Backend search time: {result.get('search_time', 0)}s")
            return True
        else:
            print("❌ Search failed:", response.status_code, response.text)
            return False
    except Exception as e:
        print("❌ Search error:", str(e))
        return False

def main():
    """Run all tests"""
    print("🚀 Starting backend tests...\n")
    print("Make sure Django server is running on http://localhost:8000")
    print("-" * 50)
    
    tests_passed = 0
    total_tests = 3
    
    if test_health_check():
        tests_passed += 1
    
    if test_file_upload():
        tests_passed += 1
    
    if test_search():
        tests_passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! Backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the errors above.")

if __name__ == "__main__":
    main()
