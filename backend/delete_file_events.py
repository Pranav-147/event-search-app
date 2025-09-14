#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_search_backend.settings')
django.setup()

from events.models import Event, UploadedFile

def delete_events_from_file(filename):
    """Delete all events from a specific source file"""
    print(f"Looking for events from file: {filename}")
    
    # Count events before deletion
    events_count = Event.objects.filter(source_file=filename).count()
    print(f"Found {events_count} events from {filename}")
    
    if events_count > 0:
        # Ask for confirmation
        confirm = input(f"Delete {events_count} events from '{filename}'? (yes/no): ")
        if confirm.lower() == 'yes':
            # Delete events
            deleted_count = Event.objects.filter(source_file=filename).delete()[0]
            print(f"✅ Deleted {deleted_count} events from {filename}")
            
            # Also delete the upload record
            upload_records = UploadedFile.objects.filter(filename=filename)
            if upload_records.exists():
                upload_records.delete()
                print(f"✅ Deleted upload records for {filename}")
        else:
            print("❌ Deletion cancelled")
    else:
        print(f"No events found for {filename}")

def delete_duplicate_events():
    """Delete duplicate events, keeping only the first occurrence of each event"""
    print("Looking for duplicate events...")
    
    # This is more complex - we'll identify duplicates by unique combination
    # of key fields and delete newer ones
    from django.db.models import Min
    
    # Get the earliest ID for each unique event (by serialno, srcaddr, starttime)
    unique_events = Event.objects.values('serialno', 'srcaddr', 'starttime').annotate(
        min_id=Min('id')
    )
    
    # Get list of IDs to keep
    ids_to_keep = [event['min_id'] for event in unique_events]
    
    # Count total events
    total_events = Event.objects.count()
    
    # Count duplicates
    duplicates = Event.objects.exclude(id__in=ids_to_keep)
    duplicate_count = duplicates.count()
    
    print(f"Total events: {total_events}")
    print(f"Unique events: {len(ids_to_keep)}")
    print(f"Duplicate events: {duplicate_count}")
    
    if duplicate_count > 0:
        confirm = input(f"Delete {duplicate_count} duplicate events? (yes/no): ")
        if confirm.lower() == 'yes':
            deleted_count = duplicates.delete()[0]
            print(f"✅ Deleted {deleted_count} duplicate events")
        else:
            print("❌ Deletion cancelled")

if __name__ == "__main__":
    print("=== EVENT CLEANUP TOOL ===\n")
    
    print("Current state:")
    os.system("python check_data.py")
    
    print("\nChoose an option:")
    print("1. Delete all events from specific file")
    print("2. Delete duplicate events (smart deduplication)")
    print("3. Show current data")
    print("4. Exit")
    
    choice = input("\nEnter choice (1-4): ")
    
    if choice == "1":
        filename = input("Enter filename to delete (e.g., 'xaa'): ")
        delete_events_from_file(filename)
    elif choice == "2":
        delete_duplicate_events()
    elif choice == "3":
        os.system("python check_data.py")
    elif choice == "4":
        print("Goodbye!")
    else:
        print("Invalid choice")
    
    print("\n=== FINAL STATE ===")
    os.system("python check_data.py")
