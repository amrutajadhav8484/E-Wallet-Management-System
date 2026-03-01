import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import '../styles/global.css';

const NotFound = () => {
  const NotFoundIcon = () => (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
  );

  const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  );

  return (
    <div className="page-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <div className="empty-state" style={{ padding: '4rem 2rem' }}>
              <NotFoundIcon style={{ color: '#667eea', opacity: 0.8 }} />
              <h1 className="page-title" style={{ fontSize: '4rem', marginTop: '1rem', marginBottom: '0.5rem' }}>
                404
              </h1>
              <h2 style={{ color: 'white', marginBottom: '1rem' }}>Page Not Found</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', marginBottom: '2rem' }}>
                The page you are looking for does not exist or has been moved.
              </p>
              <Button as={Link} to="/" className="btn-primary-custom" style={{ padding: '0.75rem 2.5rem' }}>
                <HomeIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Go to Home
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotFound;
