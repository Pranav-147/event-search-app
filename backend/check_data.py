#!/usr/bin/env python3
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_search_backend.settings')
django.setup()

from events.models import Event, UploadedFile
from django.db.models import Count

print("=== UPLOADED FILES ===")
files = UploadedFile.objects.all()
for f in files:
    print(f'{f.id}: {f.filename} ({f.total_events} events) - {f.processing_status}')

print("\n=== EVENT SOURCES ===")
sources = Event.objects.values('source_file').annotate(count=Count('id'))
for s in sources:
    print(f'{s["source_file"]}: {s["count"]} events')

print(f"\n=== SUMMARY ===")
print(f"Total uploaded files: {UploadedFile.objects.count()}")
print(f"Total events in database: {Event.objects.count()}")
print(f"Database size: ~{os.path.getsize('db.sqlite3') / 1024:.0f} KB")
