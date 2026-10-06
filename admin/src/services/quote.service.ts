import { api } from '../lib/api';
import type { Quote, QuoteStatus } from '../types/quote.types';

export const QuoteService = {
  getQuotes: async (filters?: any): Promise<Quote[]> => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/quotes?${params}`);
    return data;
  },

  getQuote: async (id: string): Promise<Quote> => {
    const { data } = await api.get(`/quotes/${id}`);
    return data;
  },

  createQuote: async (quoteData: Partial<Quote>): Promise<Quote> => {
    const { data } = await api.post('/quotes', quoteData);
    return data;
  },

  updateQuote: async (id: string, quoteData: Partial<Quote>): Promise<Quote> => {
    const { data } = await api.put(`/quotes/${id}`, quoteData);
    return data;
  },

  updateQuoteStatus: async (id: string, status: QuoteStatus): Promise<Quote> => {
    const { data } = await api.patch(`/quotes/${id}/status`, { status });
    return data;
  },

  deleteQuote: async (id: string): Promise<void> => {
    await api.delete(`/quotes/${id}`);
  },

  convertToOrder: async (id: string, conversionData: any): Promise<{ message: string; order: any; quote_number: string }> => {
    const { data } = await api.post(`/quotes/${id}/convert-to-order`, conversionData);
    return data;
  }
};
