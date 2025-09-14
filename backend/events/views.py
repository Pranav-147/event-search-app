import os
import time
import csv
import pandas as pd
from django.shortcuts import render
from django.conf import settings
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import Event, UploadedFile
from .serializers import (
    EventSerializer,
    UploadedFileSerializer,
    SearchRequestSerializer,
    SearchResponseSerializer
)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_files(request):
    """
    Handle file upload and parse event data
    """
    if 'files' not in request.FILES:
        return Response(
            {'error': 'No files uploaded'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    uploaded_files = request.FILES.getlist('files')
    results = []
    
    for uploaded_file in uploaded_files:
        try:
            # Save uploaded file
            file_path = default_storage.save(
                f'uploads/{uploaded_file.name}',
                ContentFile(uploaded_file.read())
            )
            
            # Create UploadedFile record
            file_record = UploadedFile.objects.create(
                filename=uploaded_file.name,
                file_path=file_path,
                processing_status='processing'
            )
            
            # Parse and save events
            events_count = parse_and_save_events(
                os.path.join(settings.MEDIA_ROOT, file_path),
                uploaded_file.name
            )
            
            # Update file record
            file_record.total_events = events_count
            file_record.processing_status = 'completed'
            file_record.save()
            
            results.append({
                'filename': uploaded_file.name,
                'events_count': events_count,
                'status': 'success'
            })
            
        except Exception as e:
            # Update file record as failed
            if 'file_record' in locals():
                file_record.processing_status = 'failed'
                file_record.save()
            
            results.append({
                'filename': uploaded_file.name,
                'error': str(e),
                'status': 'failed'
            })
    
    return Response({
        'message': f'Processed {len(uploaded_files)} files',
        'results': results
    })


def parse_and_save_events(file_path, source_filename):
    """
    Parse event file and save events to database
    """
    events_count = 0
    batch_size = 1000  # Process in batches for better performance
    events_batch = []
    
    try:
        # Try to read as CSV first
        with open(file_path, 'r', encoding='utf-8') as file:
            # Skip the header line if it exists
            first_line = file.readline().strip()
            
            # Detect delimiter (pipe or space)
            delimiter = '|' if '|' in first_line else ' '
            
            if 'serialno' in first_line.lower():
                # Has header, reset to beginning and use pandas
                file.seek(0)
                df = pd.read_csv(file, delimiter=delimiter, sep=delimiter if delimiter == ' ' else None)
            else:
                # No header, define columns and read
                file.seek(0)
                columns = [
                    'serialno', 'version', 'account_id', 'instance_id',
                    'srcaddr', 'dstaddr', 'srcport', 'dstport', 'protocol',
                    'packets', 'bytes', 'starttime', 'endtime', 'action', 'log_status'
                ]
                if delimiter == ' ':
                    df = pd.read_csv(file, delimiter=r'\s+', names=columns, engine='python')
                else:
                    df = pd.read_csv(file, delimiter=delimiter, names=columns)
        
        # Clean column names (remove spaces and special characters)
        df.columns = df.columns.str.strip().str.replace('-', '_')
        
        # Process each row
        for _, row in df.iterrows():
            try:
                event = Event(
                    serialno=int(row['serialno']),
                    version=int(row['version']),
                    account_id=str(row['account_id']).strip(),
                    instance_id=str(row['instance_id']).strip(),
                    srcaddr=str(row['srcaddr']).strip(),
                    dstaddr=str(row['dstaddr']).strip(),
                    srcport=int(row['srcport']),
                    dstport=int(row['dstport']),
                    protocol=int(row['protocol']),
                    packets=int(row['packets']),
                    bytes=int(row['bytes']),
                    starttime=int(row['starttime']),
                    endtime=int(row['endtime']),
                    action=str(row['action']).strip(),
                    log_status=str(row['log_status']).strip(),
                    source_file=source_filename
                )
                events_batch.append(event)
                events_count += 1
                
                # Save batch when it reaches batch_size
                if len(events_batch) >= batch_size:
                    Event.objects.bulk_create(events_batch)
                    events_batch = []
                    
            except (ValueError, KeyError) as e:
                # Skip invalid rows
                continue
        
        # Save remaining events
        if events_batch:
            Event.objects.bulk_create(events_batch)
    
    except Exception as e:
        raise Exception(f"Error parsing file {source_filename}: {str(e)}")
    
    return events_count


@api_view(['POST'])
def search_events(request):
    """
    Search events based on multiple criteria
    """
    start_time = time.time()
    
    # Validate request data
    serializer = SearchRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Build query
    query = Q()
    search_params = serializer.validated_data
    
    # Add search filters
    if search_params.get('account_id'):
        query &= Q(account_id__icontains=search_params['account_id'])
    
    if search_params.get('srcaddr'):
        query &= Q(srcaddr=search_params['srcaddr'])
    
    if search_params.get('dstaddr'):
        query &= Q(dstaddr=search_params['dstaddr'])
    
    if search_params.get('srcport'):
        query &= Q(srcport=search_params['srcport'])
    
    if search_params.get('dstport'):
        query &= Q(dstport=search_params['dstport'])
    
    if search_params.get('protocol'):
        query &= Q(protocol=search_params['protocol'])
    
    if search_params.get('action'):
        query &= Q(action__icontains=search_params['action'])
    
    if search_params.get('log_status'):
        query &= Q(log_status__icontains=search_params['log_status'])
    
    # Add time range filters
    if search_params.get('start_time'):
        query &= Q(starttime__gte=search_params['start_time'])
    
    if search_params.get('end_time'):
        query &= Q(endtime__lte=search_params['end_time'])
    
    # Execute query
    events = Event.objects.filter(query).order_by('-starttime')[:1000]  # Limit results
    total_count = Event.objects.filter(query).count()
    
    # Get unique source files
    files_searched = list(
        Event.objects.filter(query)
        .values_list('source_file', flat=True)
        .distinct()
    )
    
    # Calculate search time
    search_time = time.time() - start_time
    
    # Serialize results
    events_data = EventSerializer(events, many=True).data
    
    response_data = {
        'events': events_data,
        'total_count': total_count,
        'search_time': round(search_time, 3),
        'files_searched': files_searched
    }
    
    return Response(response_data)


@api_view(['GET'])
def get_uploaded_files(request):
    """
    Get list of uploaded files
    """
    files = UploadedFile.objects.all().order_by('-upload_date')
    serializer = UploadedFileSerializer(files, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint
    """
    return Response({'status': 'healthy', 'message': 'Event search API is running'})
