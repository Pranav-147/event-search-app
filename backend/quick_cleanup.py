#!/usr/bin/env python3
"""
Quick cleanup commands for your database
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_search_backend.settings')
django.setup()

from events.models import Event, UploadedFile

print("=== QUICK CLEANUP COMMANDS ===\n")

# 1. Delete all duplicate xaa events (keep only 200)
print("1. Remove duplicate 'xaa' events:")
xaa_events = Event.objects.filter(source_file='xaa').count()
print(f"   Current xaa events: {xaa_events}")
if xaa_events > 200:
    print(f"   🔧 Run this to keep only first 200 xaa events:")
    print(f"      Event.objects.filter(source_file='xaa')[200:].delete()")

# 2. Clear everything
print(f"\n2. Clear ALL data:")
print(f"   Event.objects.all().delete()")
print(f"   UploadedFile.objects.all().delete()")

# 3. Current status
print(f"\n3. Current status:")
print(f"   Total events: {Event.objects.count()}")
print(f"   xaa: {Event.objects.filter(source_file='xaa').count()}")
print(f"   xad: {Event.objects.filter(source_file='xad').count()}")
print(f"   xal: {Event.objects.filter(source_file='xal').count()}")
