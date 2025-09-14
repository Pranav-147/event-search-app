import React, { useState } from 'react';
import { Card, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import apiService from '../services/api';

const EventSearch = ({ onSearchResults }) => {
  const [searchParams, setSearchParams] = useState({
    account_id: '',
    srcaddr: '',
    dstaddr: '',
    srcport: '',
    dstport: '',
    protocol: '',
    action: '',
    log_status: '',
    start_time: '',
    end_time: ''
  });
  
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSearch = async () => {
    // Validate required fields before making request
    if (!searchParams.start_time || !searchParams.end_time) {
      setError('Start time and end time are required for all searches');
      return;
    }

    // Validate that start time is before end time
    const startTime = parseInt(searchParams.start_time);
    const endTime = parseInt(searchParams.end_time);
    if (startTime >= endTime) {
      setError('Start time must be before end time');
      return;
    }

    setSearching(true);
    setError(null);

    try {
      // Filter out empty values
      const filteredParams = {};
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] && searchParams[key].toString().trim() !== '') {
          filteredParams[key] = searchParams[key];
        }
      });

      // Convert numeric fields
      if (filteredParams.srcport) {
        filteredParams.srcport = parseInt(filteredParams.srcport);
      }
      if (filteredParams.dstport) {
        filteredParams.dstport = parseInt(filteredParams.dstport);
      }
      if (filteredParams.protocol) {
        filteredParams.protocol = parseInt(filteredParams.protocol);
      }
      if (filteredParams.start_time) {
        filteredParams.start_time = parseInt(filteredParams.start_time);
      }
      if (filteredParams.end_time) {
        filteredParams.end_time = parseInt(filteredParams.end_time);
      }

      const results = await apiService.searchEvents(filteredParams);
      
      if (onSearchResults) {
        onSearchResults(results);
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleClearForm = () => {
    setSearchParams({
      account_id: '',
      srcaddr: '',
      dstaddr: '',
      srcport: '',
      dstport: '',
      protocol: '',
      action: '',
      log_status: '',
      start_time: '',
      end_time: ''
    });
    setError(null);
  };

  const hasSearchParams = () => {
    // Check if at least one search field is filled (excluding time fields)
    const searchFields = ['account_id', 'srcaddr', 'dstaddr', 'srcport', 'dstport', 'protocol', 'action', 'log_status'];
    return searchFields.some(field => searchParams[field] && searchParams[field].toString().trim() !== '');
  };

  const hasOtherSearchParams = () => {
    // Check if any non-time search parameters are filled
    const searchFields = ['account_id', 'srcaddr', 'dstaddr', 'srcport', 'dstport', 'protocol', 'action', 'log_status'];
    return searchFields.some(field => searchParams[field] && searchParams[field].toString().trim() !== '');
  };

  const canSearch = () => {
    // Can search if: has search params AND has both start_time and end_time
    return hasSearchParams() && searchParams.start_time && searchParams.end_time;
  };


  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Search Event Data</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Account ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., 348935949"
                  value={searchParams.account_id}
                  onChange={(e) => handleInputChange('account_id', e.target.value)}
                  disabled={searching}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Instance ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., eni-293216456"
                  value={searchParams.instance_id}
                  onChange={(e) => handleInputChange('instance_id', e.target.value)}
                  disabled={searching}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Source Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., 159.62.125.136"
                  value={searchParams.srcaddr}
                  onChange={(e) => handleInputChange('srcaddr', e.target.value)}
                  disabled={searching}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Destination Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., 30.55.177.194"
                  value={searchParams.dstaddr}
                  onChange={(e) => handleInputChange('dstaddr', e.target.value)}
                  disabled={searching}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Source Port</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 152"
                  value={searchParams.srcport}
                  onChange={(e) => handleInputChange('srcport', e.target.value)}
                  disabled={searching}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Destination Port</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 23475"
                  value={searchParams.dstport}
                  onChange={(e) => handleInputChange('dstport', e.target.value)}
                  disabled={searching}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Protocol</Form.Label>
                <Form.Select
                  value={searchParams.protocol}
                  onChange={(e) => handleInputChange('protocol', e.target.value)}
                  disabled={searching}
                >
                  <option value="">All protocols</option>
                  <option value="1">ICMP</option>
                  <option value="6">TCP</option>
                  <option value="8">EGP</option>
                  <option value="17">UDP</option>
                  <option value="47">GRE</option>
                  <option value="50">ESP</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Action</Form.Label>
                <Form.Select
                  value={searchParams.action}
                  onChange={(e) => handleInputChange('action', e.target.value)}
                  disabled={searching}
                >
                  <option value="">All actions</option>
                  <option value="ACCEPT">ACCEPT</option>
                  <option value="REJECT">REJECT</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Log Status</Form.Label>
                <Form.Select
                  value={searchParams.log_status}
                  onChange={(e) => handleInputChange('log_status', e.target.value)}
                  disabled={searching}
                >
                  <option value="">All statuses</option>
                  <option value="OK">OK</option>
                  <option value="NODATA">NODATA</option>
                  <option value="SKIPDATA">SKIPDATA</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Start Time (Epoch) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 1725850449"
                  value={searchParams.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  disabled={searching}
                  required
                  isInvalid={!searchParams.start_time && hasOtherSearchParams()}
                />
                <Form.Text className="text-muted">
                  Earliest time in epoch format (required)
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  Start time is required for all searches
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>End Time (Epoch) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  placeholder="e.g., 1725855086"
                  value={searchParams.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                  disabled={searching}
                  required
                  isInvalid={!searchParams.end_time && hasOtherSearchParams()}
                />
                <Form.Text className="text-muted">
                  Latest time in epoch format (required)
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                  End time is required for all searches
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2">
            <Button 
              variant="primary" 
              onClick={handleSearch}
              disabled={searching || !canSearch()}
            >
              {searching ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Searching...
                </>
              ) : (
                'Search Events'
              )}
            </Button>
            
            <Button 
              variant="outline-secondary" 
              onClick={handleClearForm}
              disabled={searching}
            >
              Clear Form
            </Button>
          </div>

          {/* Warning messages */}
          {(!hasSearchParams() || !searchParams.start_time || !searchParams.end_time) && (
            <Form.Text className="text-danger mt-2">
              <strong>Please enter start time, end time, and at least one search field to perform a search.</strong>
            </Form.Text>
          )}
        </Form>


        {error && (
          <Alert variant="danger" className="mt-3">
            <strong>Search Error:</strong> {error}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default EventSearch;
