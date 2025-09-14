import React, { useState } from 'react';
import { Card, Table, Badge, Alert, Pagination, Button, Modal, ListGroup } from 'react-bootstrap';

const SearchResults = ({ results }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const eventsPerPage = 20;

  if (!results) {
    return null;
  }

  const { events, total_count, search_time, files_searched } = results;

  if (events.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Search Results</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <strong>No events found</strong>
            <br />
            Your search criteria did not match any events in the uploaded files.
            <br />
            <small className="text-muted">Search completed in {search_time} seconds</small>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(events.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = events.slice(startIndex, endIndex);

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString();
    } catch (error) {
      return timestamp;
    }
  };

  const getActionBadgeVariant = (action) => {
    return action === 'ACCEPT' ? 'success' : action === 'REJECT' ? 'danger' : 'secondary';
  };

  const getProtocolName = (protocol) => {
    const protocols = {
      1: 'ICMP',
      6: 'TCP',
      8: 'EGP',
      17: 'UDP',
      47: 'GRE',
      50: 'ESP'
    };
    return protocols[protocol] || `Protocol ${protocol}`;
  };

  const showEventDetails = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Format simplified event entry
  const formatEventSummary = (event) => {
    return `Event Found: ${event.srcaddr} → ${event.dstaddr} | Action: ${event.action} | Log Status: ${event.log_status}`;
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Search Results</h5>
          <div className="text-muted">
            <small>
              Found {total_count} event{total_count !== 1 ? 's' : ''} • 
              Search Time: {search_time}s
            </small>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Simplified Results List */}
          <ListGroup variant="flush" className="mb-4">
            {currentEvents.map((event, index) => (
              <ListGroup.Item 
                key={event.id || index}
                className="d-flex justify-content-between align-items-center py-3"
              >
                <div>
                  <div className="mb-1">
                    <span className="text-monospace">
                      {formatEventSummary(event)}
                    </span>
                  </div>
                  <div>
                    <small className="text-muted">
                      File: {event.source_file} | Search Time: {search_time} seconds
                    </small>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => showEventDetails(event)}
                >
                  View
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                <Pagination.First 
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                
                {/* Show page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last 
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Event Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Event Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <div>
              <Table bordered>
                <tbody>
                  <tr>
                    <td><strong>Serial Number:</strong></td>
                    <td>{selectedEvent.serialno}</td>
                    <td><strong>Version:</strong></td>
                    <td>{selectedEvent.version}</td>
                  </tr>
                  <tr>
                    <td><strong>Account ID:</strong></td>
                    <td>{selectedEvent.account_id}</td>
                    <td><strong>Instance ID:</strong></td>
                    <td>{selectedEvent.instance_id}</td>
                  </tr>
                  <tr>
                    <td><strong>Source Address:</strong></td>
                    <td>{selectedEvent.srcaddr}</td>
                    <td><strong>Source Port:</strong></td>
                    <td>{selectedEvent.srcport}</td>
                  </tr>
                  <tr>
                    <td><strong>Destination Address:</strong></td>
                    <td>{selectedEvent.dstaddr}</td>
                    <td><strong>Destination Port:</strong></td>
                    <td>{selectedEvent.dstport}</td>
                  </tr>
                  <tr>
                    <td><strong>Protocol:</strong></td>
                    <td>
                      <Badge bg="info">
                        {getProtocolName(selectedEvent.protocol)} ({selectedEvent.protocol})
                      </Badge>
                    </td>
                    <td><strong>Action:</strong></td>
                    <td>
                      <Badge bg={getActionBadgeVariant(selectedEvent.action)}>
                        {selectedEvent.action}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Packets:</strong></td>
                    <td>{selectedEvent.packets}</td>
                    <td><strong>Bytes:</strong></td>
                    <td>{selectedEvent.bytes?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Start Time:</strong></td>
                    <td>{formatTimestamp(selectedEvent.starttime)} ({selectedEvent.starttime})</td>
                    <td><strong>End Time:</strong></td>
                    <td>{formatTimestamp(selectedEvent.endtime)} ({selectedEvent.endtime})</td>
                  </tr>
                  <tr>
                    <td><strong>Log Status:</strong></td>
                    <td>
                      <Badge bg={selectedEvent.log_status === 'OK' ? 'success' : 'warning'}>
                        {selectedEvent.log_status}
                      </Badge>
                    </td>
                    <td><strong>Source File:</strong></td>
                    <td>{selectedEvent.source_file}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SearchResults;
