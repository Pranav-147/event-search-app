import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Alert, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import FileUpload from './components/FileUpload';
import EventSearch from './components/EventSearch';
import SearchResults from './components/SearchResults';
import apiService from './services/api';

function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Check backend health on component mount
  useEffect(() => {
    checkBackendHealth();
    loadUploadedFiles();
  }, []);

  const checkBackendHealth = async () => {
    try {
      await apiService.healthCheck();
      setBackendStatus('healthy');
    } catch (error) {
      setBackendStatus('error');
      console.error('Backend health check failed:', error);
    }
  };

  const loadUploadedFiles = async () => {
    try {
      const files = await apiService.getUploadedFiles();
      setUploadedFiles(files);
    } catch (error) {
      console.error('Failed to load uploaded files:', error);
    }
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const handleUploadSuccess = (results) => {
    // Refresh uploaded files list
    loadUploadedFiles();
    // Clear previous search results
    setSearchResults(null);
  };

  const getStatusBadge = () => {
    switch (backendStatus) {
      case 'healthy':
        return <Badge bg="success">Backend Online</Badge>;
      case 'error':
        return <Badge bg="danger">Backend Offline</Badge>;
      default:
        return <Badge bg="secondary">Checking...</Badge>;
    }
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="#">
            🔍 Event Search Application
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Link href="#upload">Upload</Nav.Link>
              <Nav.Link href="#search">Search</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Item className="d-flex align-items-center">
                {getStatusBadge()}
                {uploadedFiles.length > 0 && (
                  <Badge bg="info" className="ms-2">
                    {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                  </Badge>
                )}
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        {/* Backend Status Alert */}
        {backendStatus === 'error' && (
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>Backend Connection Error</Alert.Heading>
            <p>
              Unable to connect to the Django backend. Please ensure the backend server is running on{' '}
              <code>http://localhost:8000</code>
            </p>
            <hr />
            <div className="d-flex justify-content-end">
              <button className="btn btn-outline-danger" onClick={checkBackendHealth}>
                Retry Connection
              </button>
            </div>
          </Alert>
        )}

        {/* Application Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 text-primary">Event Search Application</h1>
          <p className="lead text-muted">
            Upload event data files and perform optimized searches across multiple fields
          </p>
        </div>

        {/* File Upload Section */}
        <section id="upload">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </section>

        {/* Search Section */}
        <section id="search">
          <EventSearch onSearchResults={handleSearchResults} />
        </section>

        {/* Search Results Section */}
        {searchResults && (
          <section id="results">
            <SearchResults results={searchResults} />
          </section>
        )}

        {/* Application Info */}
        {!searchResults && uploadedFiles.length === 0 && (
          <div className="text-center mt-5">
            <div className="card bg-light">
              <div className="card-body">
                <h5 className="card-title">Welcome to Event Search</h5>
                <p className="card-text">
                  This application allows you to upload event log files and perform fast searches 
                  across multiple fields including IP addresses, ports, protocols, and time ranges.
                </p>
                <div className="row mt-4">
                  <div className="col-md-4">
                    <h6>📁 Upload Files</h6>
                    <small className="text-muted">
                      Upload your event log files (pipe-delimited format)
                    </small>
                  </div>
                  <div className="col-md-4">
                    <h6>🔍 Search Events</h6>
                    <small className="text-muted">
                      Search by IP, port, protocol, action, or time range
                    </small>
                  </div>
                  <div className="col-md-4">
                    <h6>⚡ Fast Results</h6>
                    <small className="text-muted">
                      Get results quickly with optimized database queries
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>

      {/* Footer */}
      <footer className="mt-5 py-4 bg-light text-center">
        <Container>
          <small className="text-muted">
            Event Search Application - Django REST API + React.js Frontend
          </small>
        </Container>
      </footer>
    </div>
  );
}

export default App;
