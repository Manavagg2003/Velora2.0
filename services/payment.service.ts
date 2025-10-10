import { supabase, EDGE_FUNCTIONS } from '@/lib/supabase';
import { SUBSCRIPTION_PLANS } from '@/types/database';

export interface PaymentRequest {
  plan_tier: 'plus' | 'pro' | 'ultra';
  amount: number;
  currency: string;
  receipt: string;
  notes?: string;
}

export interface PaymentVerificationRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  plan_tier: 'plus' | 'pro' | 'ultra';
  user_id: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  coins_granted: number;
  new_balance: number;
  subscription_tier: string;
  subscription_end_date: string;
}

class PaymentService {
  private async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment Service error:', error);
      throw error;
    }
  }

  async verifyPayment(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    try {
      const response = await this.makeRequest(EDGE_FUNCTIONS.RAZORPAY_VERIFY, request);
      return response;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw new Error('Failed to verify payment');
    }
  }

  async createOrder(amountInPaise: number, notes?: Record<string,string>) {
    try {
      const payload = { amount: amountInPaise, currency: 'INR', notes };
      const res = await this.makeRequest(EDGE_FUNCTIONS.RAZORPAY_CREATE_ORDER, payload);
      return res as { order: any; key_id: string };
    } catch (e) {
      console.error('Create order error:', e);
      throw e;
    }
  }

  async getSubscriptionPlans() {
    return SUBSCRIPTION_PLANS;
  }

  async getCurrentSubscription() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Get current subscription error:', error);
      return null;
    }
  }

  async getSubscriptionHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get subscription history error:', error);
      throw new Error('Failed to fetch subscription history');
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async getPaymentHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'subscription')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get payment history error:', error);
      throw new Error('Failed to fetch payment history');
    }
  }

  // Helper method to format currency
  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Helper method to get plan details
  getPlanDetails(tier: 'free' | 'plus' | 'pro' | 'ultra') {
    return SUBSCRIPTION_PLANS.find(plan => plan.tier === tier);
  }

  // Helper method to check if subscription is active
  isSubscriptionActive(subscription: any): boolean {
    if (!subscription) return false;
    
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    
    return subscription.status === 'active' && endDate > now;
  }

  // Helper method to get days until subscription expires
  getDaysUntilExpiry(subscription: any): number | null {
    if (!subscription || !this.isSubscriptionActive(subscription)) return null;
    
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }
}

export const paymentService = new PaymentService();