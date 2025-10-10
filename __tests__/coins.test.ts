import { renderHook, act } from '@testing-library/react-native';
import { CoinProvider, useCoins } from '../contexts/CoinContext';
import { supabase } from '../lib/supabase';

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
    rpc: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('CoinContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with zero balance', () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { coin_balance: 0 },
            error: null,
          }),
        })),
      })),
    } as any);

    const { result } = renderHook(() => useCoins(), {
      wrapper: CoinProvider,
    });

    expect(result.current.balance).toBe(0);
    expect(result.current.transactions).toEqual([]);
  });

  it('should spend coins successfully', async () => {
    const mockUser = { id: 'user-123' };
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { coin_balance: 10 },
            error: null,
          }),
        })),
      })),
    } as any);

    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useCoins(), {
      wrapper: CoinProvider,
    });

    await act(async () => {
      const response = await result.current.spendCoins(5, 'Test purchase');
      expect(response.success).toBe(true);
    });

    expect(mockSupabase.rpc).toHaveBeenCalledWith('charge_user_coins', {
      p_user_id: 'user-123',
      p_amount: 5,
      p_type: 'spent',
      p_description: 'Test purchase',
    });
  });

  it('should handle insufficient coins error', async () => {
    const mockUser = { id: 'user-123' };
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { coin_balance: 2 },
            error: null,
          }),
        })),
      })),
    } as any);

    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'Insufficient coins' },
    });

    const { result } = renderHook(() => useCoins(), {
      wrapper: CoinProvider,
    });

    await act(async () => {
      const response = await result.current.spendCoins(5, 'Test purchase');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Insufficient coins');
    });
  });

  it('should grant coins successfully', async () => {
    const mockUser = { id: 'user-123' };
    
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { coin_balance: 10 },
            error: null,
          }),
        })),
      })),
    } as any);

    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useCoins(), {
      wrapper: CoinProvider,
    });

    await act(async () => {
      const response = await result.current.grantCoins(10, 'Bonus coins');
      expect(response.success).toBe(true);
    });

    expect(mockSupabase.rpc).toHaveBeenCalledWith('grant_user_coins', {
      p_user_id: 'user-123',
      p_amount: 10,
      p_type: 'earned',
      p_description: 'Bonus coins',
    });
  });

  it('should handle unauthenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const { result } = renderHook(() => useCoins(), {
      wrapper: CoinProvider,
    });

    await act(async () => {
      const response = await result.current.spendCoins(5, 'Test purchase');
      expect(response.success).toBe(false);
      expect(response.error).toBe('User not authenticated');
    });
  });
});
