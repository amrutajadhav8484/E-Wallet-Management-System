import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { getProfile } from '../api/authApi';
import { getDashboardSummary } from '../api/walletApi';
import '../styles/global.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      // Only fetch if user is authenticated
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        const [profileData, summaryData] = await Promise.all([
          getProfile(),
          getDashboardSummary().catch(() => null),
        ]);
        setProfile(profileData);
        setSummary(summaryData);
      } catch (err) {
        // If 401, token is invalid - logout user
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.');
          // Clear invalid token
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const WalletIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  );

  const BankIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 8h2v8H5zm7 0h2v8h-2zM2 4h4V2h2v2h4V2h2v2h4v2H2V4zm0 14H2v2h20v-2H2zm15-4h2v-4h-2v4z"/>
    </svg>
  );

  const BeneficiaryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  );

  const BillIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
    </svg>
  );

  const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );

  const MobileIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
    </svg>
  );

  const BalanceIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V5h-3v2.16c-1.94.42-3.5 1.68-3.5 3.66 0 2.3 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V19h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
    </svg>
  );

  if (loading) {
    return (
      <div className="page-container">
        <Container>
          <div className="loading-container">
            <div className="spinner-custom"></div>
            <p className="mt-3" style={{ color: '#667eea', fontWeight: 600 }}>Loading your dashboard...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Container>
        <div className="page-header">
          <h1 className="page-title">Welcome, {user?.name || user?.mobile}!</h1>
          <p className="page-subtitle">Manage your wallet, payments, and transactions</p>
        </div>

        {error && (
          <Row className="mt-3">
            <Col>
              <Alert variant="warning" className="alert-custom alert-warning-custom" onClose={() => setError('')} dismissible>
                <strong>⚠️ Warning:</strong> {error}
              </Alert>
            </Col>
          </Row>
        )}

        <Row className="mt-4">
          <Col md={3} className="mb-4">
            <Card className="app-card feature-card">
              <Card.Body className="card-body-custom">
                <div className="text-center mb-3">
                  <div className="feature-icon">
                    <WalletIcon />
                  </div>
                </div>
                <Card.Title className="text-center" style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Wallet
                </Card.Title>
                <Card.Text className="text-center" style={{ color: '#666', marginBottom: '1.5rem', minHeight: '3rem' }}>
                  {profile?.walletBalance !== undefined
                    ? `Balance: ₹${profile.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : 'Manage your wallet'}
                </Card.Text>
                <Button as={Link} to="/wallet" className="btn-primary-custom w-100">
                  <WalletIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Go to Wallet
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="app-card feature-card">
              <Card.Body className="card-body-custom">
                <div className="text-center mb-3">
                  <div className="feature-icon">
                    <BankIcon />
                  </div>
                </div>
                <Card.Title className="text-center" style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Bank Accounts
                </Card.Title>
                <Card.Text className="text-center" style={{ color: '#666', marginBottom: '1.5rem', minHeight: '3rem' }}>
                  Link and manage your bank accounts
                </Card.Text>
                <Button as={Link} to="/bank-accounts" className="btn-primary-custom w-100">
                  <BankIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Manage Banks
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="app-card feature-card">
              <Card.Body className="card-body-custom">
                <div className="text-center mb-3">
                  <div className="feature-icon">
                    <BeneficiaryIcon />
                  </div>
                </div>
                <Card.Title className="text-center" style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Beneficiaries
                </Card.Title>
                <Card.Text className="text-center" style={{ color: '#666', marginBottom: '1.5rem', minHeight: '3rem' }}>
                  Add and manage beneficiaries
                </Card.Text>
                <Button as={Link} to="/beneficiaries" className="btn-primary-custom w-100">
                  <BeneficiaryIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Manage Beneficiaries
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="app-card feature-card">
              <Card.Body className="card-body-custom">
                <div className="text-center mb-3">
                  <div className="feature-icon">
                    <BillIcon />
                  </div>
                </div>
                <Card.Title className="text-center" style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Bill Payments
                </Card.Title>
                <Card.Text className="text-center" style={{ color: '#666', marginBottom: '1.5rem', minHeight: '3rem' }}>
                  Pay your bills quickly
                </Card.Text>
                <Button as={Link} to="/bills" className="btn-primary-custom w-100">
                  <BillIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Pay Bills
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {summary && (
          <>
            <Row className="mt-4">
              <Col lg={8}>
                <Card className="app-card">
                  <Card.Header className="card-header-custom">Monthly spending</Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={summary.monthlySpending || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip formatter={(v) => [`₹${Number(v).toFixed(2)}`, 'Spent']} />
                        <Bar dataKey="amount" fill="#667eea" name="Spent" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="app-card">
                  <Card.Header className="card-header-custom">Category-wise expense</Card.Header>
                  <Card.Body>
                    {summary.categoryWise && summary.categoryWise.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={summary.categoryWise}
                            dataKey="total"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ label, total }) => `${label}: ₹${Number(total).toFixed(0)}`}
                          >
                            {(summary.categoryWise || []).map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => `₹${Number(v).toFixed(2)}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted mb-0 text-center">No outgoing transactions yet</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col>
                <Card className="app-card">
                  <Card.Header className="card-header-custom">Highest receiver</Card.Header>
                  <Card.Body>
                    {summary.highestReceivers && summary.highestReceivers.length > 0 ? (
                      <div className="d-flex flex-wrap gap-3">
                        {summary.highestReceivers.map((r, i) => (
                          <div
                            key={i}
                            className="border rounded px-3 py-2"
                            style={{ minWidth: '180px' }}
                          >
                            <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }} title={r.label}>
                              {r.label}
                            </div>
                            <div className="fw-bold">₹{Number(r.total).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted mb-0">No transfers to show</p>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {profile && (
          <Row className="mt-4">
            <Col>
              <Card className="app-card">
                <Card.Header className="card-header-custom">
                  <UserIcon />
                  Profile Information
                </Card.Header>
                <Card.Body className="card-body-custom">
                  <div className="account-details-container">
                    <div className="detail-item">
                      <div className="detail-label">
                        <UserIcon />
                        User ID:
                      </div>
                      <div className="detail-value">{profile.userId || user?.userId}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <UserIcon />
                        Name:
                      </div>
                      <div className="detail-value">{profile.name || user?.name}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <MobileIcon />
                        Mobile:
                      </div>
                      <div className="detail-value">{profile.mobile || user?.mobile}</div>
                    </div>
                    {profile.walletId && (
                      <div className="detail-item">
                        <div className="detail-label">
                          <WalletIcon />
                          Wallet ID:
                        </div>
                        <div className="detail-value">{profile.walletId}</div>
                      </div>
                    )}
                    {profile.walletBalance !== undefined && (
                      <div className="detail-item">
                        <div className="detail-label">
                          <BalanceIcon />
                          Wallet Balance:
                        </div>
                        <div className="detail-value balance">
                          ₹{profile.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;
