import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import '../styles/global.css';

const Home = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Don't render home page if user is authenticated
  if (loading) {
    return (
      <div className="page-container">
        <Container>
          <div className="loading-container">
            <div className="spinner-custom"></div>
            <p className="mt-3" style={{ color: '#667eea', fontWeight: 600 }}>Loading...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }
  const WalletIcon = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  );

  const SecurityIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
    </svg>
  );

  const PaymentIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  );

  const TransactionIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );

  return (
    <div className="page-container">
      <Container>
        <div className="page-header">
          <h1 className="page-title">
            <WalletIcon style={{ display: 'inline-block', marginRight: '15px', verticalAlign: 'middle' }} />
            Welcome to E-Wallet
          </h1>
          <p className="page-subtitle">Your secure digital wallet for managing money, payments, and transactions</p>
        </div>

        <Row className="mt-5">
          <Col md={4} className="mb-4">
            <Card className="app-card feature-card">
              <Card.Body className="card-body-custom text-center">
                <div className="feature-icon">
                  <SecurityIcon />
                </div>
                <Card.Title style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Secure
                </Card.Title>
                <Card.Text style={{ color: '#666', marginBottom: '1.5rem' }}>
                  Bank-level security to keep your money safe
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="app-card feature-card">
              <Card.Body className="card-body-custom text-center">
                <div className="feature-icon">
                  <PaymentIcon />
                </div>
                <Card.Title style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Fast Payments
                </Card.Title>
                <Card.Text style={{ color: '#666', marginBottom: '1.5rem' }}>
                  Quick and easy bill payments and transfers
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="app-card feature-card">
              <Card.Body className="card-body-custom text-center">
                <div className="feature-icon">
                  <TransactionIcon />
                </div>
                <Card.Title style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Track Everything
                </Card.Title>
                <Card.Text style={{ color: '#666', marginBottom: '1.5rem' }}>
                  Complete transaction history at your fingertips
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={8} className="mx-auto">
            <Card className="app-card">
              <Card.Body className="card-body-custom text-center">
                <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Get Started Today</h3>
                <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
                  Join thousands of users who trust E-Wallet for their digital payments
                </p>
                <div>
                  <Button as={Link} to="/signup" className="btn-primary-custom me-3" style={{ padding: '0.75rem 2.5rem' }}>
                    Get Started
                  </Button>
                  <Button as={Link} to="/login" className="btn-outline-primary-custom" style={{ padding: '0.75rem 2.5rem' }}>
                    Login
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
