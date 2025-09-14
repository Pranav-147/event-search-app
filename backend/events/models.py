from django.db import models


class Event(models.Model):
    serialno = models.IntegerField()
    version = models.IntegerField()
    account_id = models.CharField(max_length=50, db_index=True)
    instance_id = models.CharField(max_length=50, db_index=True)
    srcaddr = models.GenericIPAddressField(db_index=True)
    dstaddr = models.GenericIPAddressField(db_index=True)
    srcport = models.IntegerField(db_index=True)
    dstport = models.IntegerField(db_index=True)
    protocol = models.IntegerField(db_index=True)
    packets = models.IntegerField()
    bytes = models.BigIntegerField()
    starttime = models.IntegerField(db_index=True)  # epoch timestamp
    endtime = models.IntegerField(db_index=True)    # epoch timestamp
    action = models.CharField(max_length=10, db_index=True)
    log_status = models.CharField(max_length=10)
    source_file = models.CharField(max_length=255)  # Track which file this event came from
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['srcaddr', 'starttime']),
            models.Index(fields=['dstaddr', 'starttime']),
            models.Index(fields=['action', 'starttime']),
            models.Index(fields=['account_id', 'starttime']),
            models.Index(fields=['starttime', 'endtime']),
        ]
    
    def __str__(self):
        return f"Event {self.serialno}: {self.srcaddr} -> {self.dstaddr} | {self.action}"


class UploadedFile(models.Model):
    filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    upload_date = models.DateTimeField(auto_now_add=True)
    total_events = models.IntegerField(default=0)
    processing_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed')
        ],
        default='pending'
    )
    
    def __str__(self):
        return f"{self.filename} - {self.processing_status}"
