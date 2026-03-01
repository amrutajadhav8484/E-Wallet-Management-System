import http from './http';

export const payBill = async (walletId, amount, type, pin, consumerInfo = null, operatorOrCard = null) => {
  const params = { walletId, amount, type, pin };
  if (consumerInfo != null && consumerInfo !== '') params.consumerInfo = consumerInfo;
  if (operatorOrCard != null && operatorOrCard !== '') params.operatorOrCard = operatorOrCard;
  const response = await http.post(`/api/bills/pay`, null, { params });
  return response.data;
};

export const getBillHistory = async (walletId, page = 0, size = 10) => {
  const response = await http.get(`/api/bills/history`, {
    params: { walletId, page, size },
  });
  return response.data;
};

export const getBillReceipt = async (billId) => {
  const response = await http.get(`/api/bills/${billId}/receipt`);
  return response.data;
};

export const validateConsumer = async (billType, consumerInfo = null, operatorOrCard = null) => {
  const params = { billType };
  if (consumerInfo != null && consumerInfo !== '') params.consumerInfo = consumerInfo;
  if (operatorOrCard != null && operatorOrCard !== '') params.operatorOrCard = operatorOrCard;
  const response = await http.get(`/api/bills/validate`, { params });
  return response.data;
};

export const fetchBill = async (billType, consumerInfo = null, operatorOrCard = null) => {
  const params = { billType };
  if (consumerInfo != null && consumerInfo !== '') params.consumerInfo = consumerInfo;
  if (operatorOrCard != null && operatorOrCard !== '') params.operatorOrCard = operatorOrCard;
  const response = await http.get(`/api/bills/fetch`, { params });
  return response.data;
};

export const getOperators = async (billType) => {
  const response = await http.get(`/api/bills/operators`, { params: { billType } });
  return response.data;
};

export const getSavedBillers = async () => {
  const response = await http.get(`/api/bills/saved`);
  return response.data;
};

export const addSavedBiller = async (body) => {
  const response = await http.post(`/api/bills/saved`, body);
  return response.data;
};

export const deleteSavedBiller = async (savedBillerId) => {
  await http.delete(`/api/bills/saved/${savedBillerId}`);
};
