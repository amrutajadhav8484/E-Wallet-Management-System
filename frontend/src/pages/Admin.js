import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import {
  getAllUsers,
  getUserById,
  assignAdminRole,
  removeAdminRole,
  blockUser,
  unblockUser,
} from '../api/adminApi';
import '../styles/global.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId) => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserById(userId);
      setSelectedUser(data);
      setShowUserModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to assign admin role to this user?')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      await assignAdminRole(userId);
      setSuccess('Admin role assigned successfully!');
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign admin role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to remove admin role from this user?')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      await removeAdminRole(userId);
      setSuccess('Admin role removed successfully!');
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove admin role');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    if (!window.confirm('Are you sure you want to block this user?')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      await blockUser(userId);
      setSuccess('User blocked successfully!');
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to block user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId) => {
    if (!window.confirm('Are you sure you want to unblock this user?')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      await unblockUser(userId);
      setSuccess('User unblocked successfully!');
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unblock user');
    } finally {
      setLoading(false);
    }
  };

  const AdminIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
    </svg>
  );

  return (
    <div className="page-container">
      <Container>
        <div className="page-header">
          <h1 className="page-title">
            <AdminIcon style={{ display: 'inline-block', marginRight: '15px', verticalAlign: 'middle' }} />
            Admin Panel - User Management
          </h1>
          <p className="page-subtitle">Manage users, roles, and access controls</p>
        </div>

        {error && (
          <Row className="mt-3">
            <Col>
              <Alert variant="danger" className="alert-custom alert-danger-custom" onClose={() => setError('')} dismissible>
                <strong>⚠️ Error:</strong> {error}
              </Alert>
            </Col>
          </Row>
        )}

        {success && (
          <Row className="mt-3">
            <Col>
              <Alert variant="success" className="alert-custom alert-success-custom" onClose={() => setSuccess('')} dismissible>
                <strong>✓ Success:</strong> {success}
              </Alert>
            </Col>
          </Row>
        )}

        <Row className="mt-4">
          <Col>
            <Card className="app-card">
              <Card.Header className="card-header-custom">
                <AdminIcon />
                All Users
                <Button
                  variant="outline-light"
                  size="sm"
                  className="float-end"
                  onClick={loadUsers}
                  disabled={loading}
                  style={{ border: '1px solid rgba(255,255,255,0.5)' }}
                >
                  Refresh
                </Button>
              </Card.Header>
              <Card.Body className="card-body-custom">
                {loading && users.length === 0 ? (
                  <div className="loading-container">
                    <div className="spinner-custom"></div>
                    <p className="mt-2" style={{ color: '#667eea', fontWeight: 600 }}>Loading users...</p>
                  </div>
                ) : users.length > 0 ? (
                  <div className="table-responsive">
                    <Table className="table-custom" striped hover responsive>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Wallet ID</th>
                      <th>Wallet Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.userId}>
                        <td>{u.userId}</td>
                        <td>{u.name}</td>
                        <td>{u.mobile}</td>
                        <td>{u.walletId || 'N/A'}</td>
                        <td>₹{u.walletBalance !== undefined ? u.walletBalance : '0.00'}</td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            className="me-1 mb-1"
                            onClick={() => handleViewUser(u.userId)}
                            disabled={loading}
                          >
                            View
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-1 mb-1"
                            onClick={() => handleAssignAdmin(u.userId)}
                            disabled={loading}
                          >
                            Make Admin
                          </Button>
                          <Button
                            variant="warning"
                            size="sm"
                            className="me-1 mb-1"
                            onClick={() => handleRemoveAdmin(u.userId)}
                            disabled={loading}
                          >
                            Remove Admin
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="me-1 mb-1"
                            onClick={() => handleBlockUser(u.userId)}
                            disabled={loading}
                          >
                            Block
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="mb-1"
                            onClick={() => handleUnblockUser(u.userId)}
                            disabled={loading}
                          >
                            Unblock
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <AdminIcon />
                    <p>No users found.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

      {/* User Details Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser ? (
            <div>
              <p>
                <strong>User ID:</strong> {selectedUser.userId}
              </p>
              <p>
                <strong>Name:</strong> {selectedUser.name}
              </p>
              <p>
                <strong>Mobile:</strong> {selectedUser.mobile}
              </p>
              {selectedUser.walletId && (
                <p>
                  <strong>Wallet ID:</strong> {selectedUser.walletId}
                </p>
              )}
              {selectedUser.walletBalance !== undefined && (
                <p>
                  <strong>Wallet Balance:</strong> ₹{selectedUser.walletBalance}
                </p>
              )}
            </div>
          ) : (
            <Spinner animation="border" />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      </Container>
    </div>
  );
};

export default Admin;
