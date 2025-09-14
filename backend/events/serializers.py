from rest_framework import serializers
from .models import Event, UploadedFile


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = '__all__'


class SearchRequestSerializer(serializers.Serializer):
    # Search parameters
    account_id = serializers.CharField(required=False, allow_blank=True)
    srcaddr = serializers.CharField(required=False, allow_blank=True)
    dstaddr = serializers.CharField(required=False, allow_blank=True)
    srcport = serializers.IntegerField(required=False)
    dstport = serializers.IntegerField(required=False)
    protocol = serializers.IntegerField(required=False)
    action = serializers.CharField(required=False, allow_blank=True)
    log_status = serializers.CharField(required=False, allow_blank=True)
    
    # Time range parameters - NOW REQUIRED
    start_time = serializers.IntegerField(required=True, help_text="Start time in epoch format (required)")
    end_time = serializers.IntegerField(required=True, help_text="End time in epoch format (required)")
    
    def validate(self, data):
        """
        Custom validation to ensure start_time is before end_time
        """
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError({
                    'time_range': 'Start time must be before end time'
                })
        
        # Ensure at least one search parameter is provided (besides time)
        search_fields = ['account_id', 'srcaddr', 'dstaddr', 'srcport', 'dstport', 'protocol', 'action', 'log_status']
        has_search_criteria = any(data.get(field) for field in search_fields if data.get(field) not in [None, ''])
        
        if not has_search_criteria:
            raise serializers.ValidationError({
                'search_criteria': 'At least one search parameter must be provided (account_id, srcaddr, dstaddr, etc.)'
            })
        
        return data


class SearchResponseSerializer(serializers.Serializer):
    events = EventSerializer(many=True)
    total_count = serializers.IntegerField()
    search_time = serializers.FloatField()
    files_searched = serializers.ListField(child=serializers.CharField())
