import React, { useState } from 'react';
import { Card, Button, Form, Alert, ProgressBar, ListGroup } from 'react-bootstrap';
import apiService from '../services/api';

const FileUpload = ({ onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    setError(null);
    setSuccess(null);
    setUploadResults([]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadResults([]);

    try {
      const result = await apiService.uploadFiles(selectedFiles);
      setUploadResults(result.results);
      
      const successfulUploads = result.results.filter(r => r.status === 'success');
      const failedUploads = result.results.filter(r => r.status === 'failed');
      
      if (successfulUploads.length > 0) {
        setSuccess(`Successfully uploaded ${successfulUploads.length} file(s). Total events processed: ${successfulUploads.reduce((sum, r) => sum + r.events_count, 0)}`);
        if (onUploadSuccess) {
          onUploadSuccess(result.results);
        }
      }
      
      if (failedUploads.length > 0) {
        setError(`Failed to upload ${failedUploads.length} file(s). Check details below.`);
      }
      
      // Clear file input
      setSelectedFiles([]);
      document.getElementById('fileInput').value = '';
      
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Upload Event Data Files</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Select Event Data Files</Form.Label>
            <Form.Control
              id="fileInput"
              type="file"
              multiple
              accept=".log,.txt,.csv"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <Form.Text className="text-muted">
              Select one or more event log files (.log, .txt, .csv). Files should contain pipe-delimited event data.
            </Form.Text>
          </Form.Group>

          {selectedFiles.length > 0 && (
            <div className="mb-3">
              <h6>Selected Files:</h6>
              <ListGroup variant="flush">
                {selectedFiles.map((file, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{file.name}</strong>
                      <br />
                      <small className="text-muted">{formatFileSize(file.size)}</small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          <Button 
            variant="primary" 
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="me-2"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>

          {uploading && (
            <ProgressBar animated now={100} className="mt-3" />
          )}
        </Form>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mt-3">
            {success}
          </Alert>
        )}

        {uploadResults.length > 0 && (
          <div className="mt-3">
            <h6>Upload Results:</h6>
            <ListGroup>
              {uploadResults.map((result, index) => (
                <ListGroup.Item 
                  key={index} 
                  variant={result.status === 'success' ? 'success' : 'danger'}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{result.filename}</strong>
                      <br />
                      {result.status === 'success' ? (
                        <small>✅ {result.events_count} events processed</small>
                      ) : (
                        <small>❌ Error: {result.error}</small>
                      )}
                    </div>
                    <span className={`badge ${result.status === 'success' ? 'bg-success' : 'bg-danger'}`}>
                      {result.status}
                    </span>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FileUpload;
