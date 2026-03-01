import http from './http';

export const linkBankAccount = async (walletId, bankData) => {
  const response = await http.post(`/api/v1/bank-accounts/link`, bankData, {
    params: { walletId },
  });
  return response.data;
};

export const getBankAccount = async (walletId) => {
  const response = await http.get(`/api/v1/bank-accounts/wallet/${walletId}`);
  return response.data;
};
