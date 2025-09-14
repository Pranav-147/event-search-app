#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_search_backend.settings')
django.setup()

from events.models import Event, UploadedFile

def clear_all_data():
    """Delete ALL events and uploaded file records"""
    
    print("=== CURRENT DATABASE STATE ===")
    print(f"Total events: {Event.objects.count()}")
    print(f"Total uploaded files: {UploadedFile.objects.count()}")
    print(f"Database size: ~{os.path.getsize('db.sqlite3') / 1024:.0f} KB")
    
    print("\n⚠️  WARNING: This will delete ALL data!")
    print("- All event records")
    print("- All uploaded file records")
    print("- You'll need to re-upload your files")
    
    confirm = input("\nAre you SURE you want to delete everything? (type 'DELETE ALL'): ")
    
    if confirm == 'DELETE ALL':
        print("Deleting all events...")
        events_deleted = Event.objects.all().delete()[0]
        print(f"✅ Deleted {events_deleted} events")
        
        print("Deleting all upload records...")
        files_deleted = UploadedFile.objects.all().delete()[0]
        print(f"✅ Deleted {files_deleted} upload records")
        
        print("Clearing uploaded files directory...")
        import shutil
        uploads_dir = "media/uploads"
        if os.path.exists(uploads_dir):
            shutil.rmtree(uploads_dir)
            os.makedirs(uploads_dir)
            print("✅ Cleared uploads directory")
        
        print("\n🎉 Database completely cleared!")
        print("You can now upload your files fresh without duplicates.")
        
    else:
        print("❌ Clear operation cancelled")
        print("Database unchanged")

def vacuum_database():
    """Optimize database size after deletions"""
    print("Optimizing database...")
    from django.db import connection
    cursor = connection.cursor()
    cursor.execute("VACUUM;")
    print("✅ Database optimized")

if __name__ == "__main__":
    print("=== DATABASE CLEAR TOOL ===\n")
    
    clear_all_data()
    
    # If data was cleared, optimize the database
    if Event.objects.count() == 0:
        vacuum_database()
        
        print(f"\n=== FINAL STATE ===")
        print(f"Events: {Event.objects.count()}")
        print(f"Files: {UploadedFile.objects.count()}")
        print(f"Database size: ~{os.path.getsize('db.sqlite3') / 1024:.0f} KB")
