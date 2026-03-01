import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table, Modal, Pagination } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { payBill, getBillHistory, getBillReceipt, fetchBill, getOperators, getSavedBillers, addSavedBiller, deleteSavedBiller } from '../api/billApi';
import '../styles/global.css';

const Bills = () => {
  const { user, isAuthenticated } = useAuth();
  const [walletId, setWalletId] = useState('');
  const [billData, setBillData] = useState({
    amount: '',
    type: 'MOBILE_RECHARGE',
    pin: '',
    consumerInfo: '',
    operatorOrCard: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState({ content: [], totalPages: 0, number: 0, totalElements: 0 });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [fetchedBill, setFetchedBill] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [operators, setOperators] = useState([]);
  const [savedBillers, setSavedBillers] = useState([]);
  const [savedBillersLoading, setSavedBillersLoading] = useState(false);
  const historyPageSize = 5;

  useEffect(() => {
    if (isAuthenticated && user?.walletId) {
      setWalletId(user.walletId.toString());
    }
  }, [user, isAuthenticated]);

  const fetchHistory = useCallback(async (wid, page = 0) => {
    if (!wid || !/^\d+$/.test(wid)) return;
    setHistoryLoading(true);
    try {
      const data = await getBillHistory(parseInt(wid), page, historyPageSize);
      setHistory({
        content: data.content || [],
        totalPages: data.totalPages ?? 0,
        number: data.number ?? 0,
        totalElements: data.totalElements ?? 0,
      });
    } catch (err) {
      setHistory({ content: [], totalPages: 0, number: 0, totalElements: 0 });
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (walletId) fetchHistory(walletId, 0);
  }, [walletId, fetchHistory]);

  useEffect(() => {
    getOperators(billData.type).then(setOperators).catch(() => setOperators([]));
  }, [billData.type]);

  const loadSavedBillers = useCallback(async () => {
    setSavedBillersLoading(true);
    try {
      const list = await getSavedBillers();
      setSavedBillers(list || []);
    } catch {
      setSavedBillers([]);
    } finally {
      setSavedBillersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.walletId) loadSavedBillers();
  }, [isAuthenticated, user?.walletId, loadSavedBillers]);

  const openReceipt = async (billId) => {
    setReceiptLoading(true);
    setReceipt(null);
    try {
      const data = await getBillReceipt(billId);
      setReceipt(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load receipt');
    } finally {
      setReceiptLoading(false);
    }
  };

  const closeReceipt = () => setReceipt(null);

  const goToHistoryPage = (page) => {
    if (walletId) fetchHistory(walletId, page);
  };

  const quickPay = (saved) => {
    setBillData((prev) => ({
      ...prev,
      type: saved.billType,
      consumerInfo: saved.consumerInfo || '',
      operatorOrCard: saved.operatorOrCard || '',
    }));
    setFetchedBill(null);
    setError('');
  };

  const handleSaveCurrentBiller = async () => {
    const nickname = window.prompt('Nickname for this biller (optional)', '');
    if (nickname === null) return;
    try {
      await addSavedBiller({
        billType: billData.type,
        consumerInfo: billData.consumerInfo || null,
        operatorOrCard: billData.operatorOrCard || null,
        nickname: nickname.trim() || null,
      });
      setSuccess('Biller saved. You can use Quick Pay next time.');
      loadSavedBillers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save biller');
    }
  };

  const handleDeleteSavedBiller = async (id) => {
    if (!window.confirm('Remove this saved biller?')) return;
    try {
      await deleteSavedBiller(id);
      setSuccess('Saved biller removed.');
      loadSavedBillers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to remove');
    }
  };

  const BillIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
    </svg>
  );

  const WalletIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  );

  const AmountIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V5h-3v2.16c-1.94.42-3.5 1.68-3.5 3.66 0 2.3 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V19h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
    </svg>
  );

  const PinIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  );

  const TypeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );

  const billTypes = [
    { value: 'MOBILE_RECHARGE', label: 'Mobile Recharge' },
    { value: 'FAST_TAG', label: 'Fast Tag' },
    { value: 'CABLE_TV', label: 'Cable TV' },
    { value: 'BOOK_A_CYLINDER', label: 'Book a Cylinder' },
    { value: 'RENT_PAYMENT', label: 'Rent Payment' },
    { value: 'ELECTRICITY_BILL', label: 'Electricity Bill' },
    { value: 'INTERNET_BILL', label: 'Internet Bill' },
    { value: 'SETUPBOX_RECHARGE', label: 'Setup Box Recharge' },
    { value: 'WATER_BILL', label: 'Water Bill' },
  ];

  const handleChange = (e) => {
    setBillData({ ...billData, [e.target.name]: e.target.value });
    setError('');
    setFetchedBill(null);
  };

  const handleFetchBill = async () => {
    setFetchLoading(true);
    setError('');
    setFetchedBill(null);
    try {
      const data = await fetchBill(
        billData.type,
        billData.consumerInfo || null,
        billData.operatorOrCard || null
      );
      setFetchedBill(data);
      if (data.valid && data.dueAmount != null) {
        setBillData((prev) => ({ ...prev, amount: String(data.dueAmount) }));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch bill');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletId) {
      setError('Please enter wallet ID');
      return;
    }
    if (!/^\d+$/.test(walletId)) {
      setError('Wallet ID must be a valid number');
      return;
    }
    if (!billData.amount || parseFloat(billData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!billData.pin || billData.pin.length !== 4) {
      setError('Please enter a valid 4-digit PIN');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await payBill(
        parseInt(walletId),
        parseFloat(billData.amount),
        billData.type,
        billData.pin,
        billData.consumerInfo || null,
        billData.operatorOrCard || null
      );
      setSuccess(`Bill payment of ₹${billData.amount} for ${billTypes.find(t => t.value === billData.type)?.label} successful!`);
      setBillData({
        amount: '',
        type: 'MOBILE_RECHARGE',
        pin: '',
        consumerInfo: '',
        operatorOrCard: '',
      });
      setFetchedBill(null);
      if (walletId) fetchHistory(walletId, 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to pay bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Container>
        <div className="page-header">
          <h1 className="page-title">
            <BillIcon style={{ display: 'inline-block', marginRight: '15px', verticalAlign: 'middle' }} />
            Bill Payment
          </h1>
          <p className="page-subtitle">Pay your bills quickly and securely</p>
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

        {savedBillers.length > 0 && (
          <Row className="mt-4">
            <Col>
              <Card className="app-card">
                <Card.Header className="card-header-custom">
                  Saved billers
                </Card.Header>
                <Card.Body className="card-body-custom">
                  {savedBillersLoading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      {savedBillers.map((s) => (
                        <div key={s.savedBillerId} className="border rounded px-3 py-2 d-flex align-items-center gap-2">
                          <span>
                            {s.nickname || [billTypes.find(t => t.value === s.billType)?.label, s.consumerInfo, s.operatorOrCard].filter(Boolean).join(' · ')}
                          </span>
                          <Button variant="outline-primary" size="sm" onClick={() => quickPay(s)}>Quick Pay</Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDeleteSavedBiller(s.savedBillerId)}>Remove</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        <Row className="mt-4">
          <Col md={6} className="mx-auto">
            <Card className="app-card">
              <Card.Header className="card-header-custom">
                <BillIcon />
                Pay Bill
              </Card.Header>
              <Card.Body className="card-body-custom">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <WalletIcon />
                      Wallet ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={walletId}
                      onChange={(e) => setWalletId(e.target.value)}
                      placeholder="Enter wallet ID"
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <TypeIcon />
                      Bill Type
                    </Form.Label>
                    <Form.Select
                      name="type"
                      value={billData.type}
                      onChange={handleChange}
                      className="form-control-custom"
                      required
                    >
                      {billTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Mobile / Consumer ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="consumerInfo"
                      value={billData.consumerInfo}
                      onChange={handleChange}
                      placeholder="e.g. mobile number, consumer ID, vehicle number"
                      className="form-control-custom"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Operator
                    </Form.Label>
                    {operators.length > 0 ? (
                      <Form.Select
                        name="operatorOrCard"
                        value={billData.operatorOrCard}
                        onChange={handleChange}
                        className="form-control-custom"
                      >
                        <option value="">Select operator</option>
                        {operators.map((op) => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </Form.Select>
                    ) : (
                      <Form.Control
                        type="text"
                        name="operatorOrCard"
                        value={billData.operatorOrCard}
                        onChange={handleChange}
                        placeholder="e.g. Airtel, Jio, discom name"
                        className="form-control-custom"
                      />
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Button
                      type="button"
                      variant="outline-primary"
                      className="w-100"
                      onClick={handleFetchBill}
                      disabled={fetchLoading}
                    >
                      {fetchLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Fetching bill...
                        </>
                      ) : (
                        'Validate & fetch bill'
                      )}
                    </Button>
                    <Form.Text className="text-muted d-block mt-1">
                      Validate consumer and get due amount (simulated). Then pay below.
                    </Form.Text>
                    <Button type="button" variant="link" className="p-0 mt-1 small" onClick={handleSaveCurrentBiller}>
                      Save current as biller (Quick Pay later)
                    </Button>
                  </Form.Group>
                  {fetchedBill && (
                    <Alert
                      variant={fetchedBill.valid ? 'success' : 'danger'}
                      className="mb-3"
                      dismissible
                      onClose={() => setFetchedBill(null)}
                    >
                      <strong>{fetchedBill.valid ? '✓ Bill fetched' : 'Invalid'}</strong>
                      <span className="d-block">{fetchedBill.message}</span>
                      {fetchedBill.valid && (
                        <>
                          {fetchedBill.billerName && (
                            <span className="d-block">Biller: {fetchedBill.billerName}</span>
                          )}
                          {fetchedBill.dueAmount != null && (
                            <span className="d-block">Due amount: ₹{Number(fetchedBill.dueAmount).toFixed(2)}</span>
                          )}
                          {fetchedBill.dueDate && (
                            <span className="d-block">Due date: {new Date(fetchedBill.dueDate).toLocaleDateString()}</span>
                          )}
                          <span className="d-block small mt-1">Amount below has been prefilled. You can change it and pay.</span>
                        </>
                      )}
                    </Alert>
                  )}
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <AmountIcon />
                      Amount
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={billData.amount}
                      onChange={handleChange}
                      placeholder="Enter amount"
                      min="0.01"
                      step="0.01"
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <PinIcon />
                      PIN
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="pin"
                      value={billData.pin}
                      onChange={handleChange}
                      placeholder="Enter 4-digit PIN"
                      maxLength={4}
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="btn-primary-custom w-100" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <BillIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                        Pay Bill
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <Card className="app-card">
              <Card.Header className="card-header-custom">
                <BillIcon style={{ marginRight: '8px' }} />
                Recent bill payments
              </Card.Header>
              <Card.Body className="card-body-custom">
                {historyLoading ? (
                  <div className="text-center py-4">
                    <span className="spinner-border" role="status" aria-hidden="true"></span>
                    <span className="ms-2">Loading history...</span>
                  </div>
                ) : !walletId ? (
                  <p className="text-muted mb-0">Enter wallet ID and pay a bill to see history.</p>
                ) : history.content.length === 0 ? (
                  <p className="text-muted mb-0">No bill payments yet.</p>
                ) : (
                  <>
                    <Table responsive className="table-custom mb-0">
                      <thead>
                        <tr>
                          <th>Date & time</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Reference</th>
                          <th>Consumer / Operator</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.content.map((b) => (
                          <tr key={b.billId}>
                            <td>{b.paymentTime ? new Date(b.paymentTime).toLocaleString() : '—'}</td>
                            <td>{billTypes.find(t => t.value === b.billType)?.label ?? b.billType}</td>
                            <td>₹{b.amount != null ? Number(b.amount).toFixed(2) : '—'}</td>
                            <td><code className="small">{b.referenceNumber || '—'}</code></td>
                            <td>{[b.consumerInfo, b.operatorOrCard].filter(Boolean).join(' / ') || '—'}</td>
                            <td>
                              <Button variant="outline-primary" size="sm" onClick={() => openReceipt(b.billId)}>
                                View receipt
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {history.totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-3">
                        <Pagination>
                          <Pagination.Prev
                            disabled={history.number <= 0}
                            onClick={() => goToHistoryPage(history.number - 1)}
                          />
                          <Pagination.Item disabled>
                            Page {history.number + 1} of {history.totalPages}
                          </Pagination.Item>
                          <Pagination.Next
                            disabled={history.number >= history.totalPages - 1}
                            onClick={() => goToHistoryPage(history.number + 1)}
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Modal show={receipt !== null} onHide={closeReceipt} centered>
          <Modal.Header closeButton>
            <Modal.Title>Payment receipt</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {receiptLoading ? (
              <div className="text-center py-3">
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span className="ms-2">Loading...</span>
              </div>
            ) : receipt ? (
              <div className="receipt-details">
                <p className="mb-1"><strong>Reference:</strong> <code>{receipt.referenceNumber || '—'}</code></p>
                <p className="mb-1"><strong>Bill type:</strong> {billTypes.find(t => t.value === receipt.billType)?.label ?? receipt.billType}</p>
                <p className="mb-1"><strong>Amount:</strong> ₹{receipt.amount != null ? Number(receipt.amount).toFixed(2) : '—'}</p>
                <p className="mb-1"><strong>Date & time:</strong> {receipt.paymentTime ? new Date(receipt.paymentTime).toLocaleString() : '—'}</p>
                {receipt.consumerInfo && <p className="mb-1"><strong>Consumer ID:</strong> {receipt.consumerInfo}</p>}
                {receipt.operatorOrCard && <p className="mb-1"><strong>Operator:</strong> {receipt.operatorOrCard}</p>}
                {receipt.balanceAfter != null && <p className="mb-0"><strong>Balance after:</strong> ₹{Number(receipt.balanceAfter).toFixed(2)}</p>}
              </div>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeReceipt}>Close</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Bills;
