import { supabase } from '@/lib/supabase';
import { SubscriptionTier, SUBSCRIPTION_PLANS } from '@/types/database';

export class PaymentService {
  async createSubscription(userId: string, tier: SubscriptionTier): Promise<{ success: boolean; error?: string }> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.tier === tier);
      if (!plan) {
        return { success: false, error: 'Invalid subscription tier' };
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: tier,
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate.toISOString(),
          coin_balance: supabase.rpc('increment_coins', { user_id: userId, amount: plan.coins }),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      const { error: transactionError } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: userId,
          amount: plan.coins,
          transaction_type: 'subscription',
          description: `${plan.name} subscription - ${plan.coins} coins`,
        });

      if (transactionError) throw transactionError;

      return { success: true };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return { success: false, error: 'Failed to create subscription' };
    }
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          razorpay_subscription_id: null,
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }

  async checkSubscriptionStatus(userId: string): Promise<{ active: boolean; tier: SubscriptionTier }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_end_date')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return { active: false, tier: 'free' };
      }

      const endDate = data.subscription_end_date ? new Date(data.subscription_end_date) : null;
      const now = new Date();

      if (endDate && endDate > now) {
        return { active: true, tier: data.subscription_tier as SubscriptionTier };
      }

      return { active: false, tier: 'free' };
    } catch (error) {
      console.error('Error checking subscription:', error);
      return { active: false, tier: 'free' };
    }
  }

  async initializeRazorpay(amount: number, tier: SubscriptionTier): Promise<any> {
    const plan = SUBSCRIPTION_PLANS.find(p => p.tier === tier);
    if (!plan) {
      throw new Error('Invalid subscription tier');
    }

    return {
      key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: 'USD',
      name: 'Velora',
      description: `${plan.name} Subscription`,
      prefill: {
        name: '',
        email: '',
      },
      theme: {
        color: '#FF6B35',
      },
    };
  }

  getPlanDetails(tier: SubscriptionTier) {
    return SUBSCRIPTION_PLANS.find(p => p.tier === tier);
  }

  getAllPlans() {
    return SUBSCRIPTION_PLANS;
  }
}

export const paymentService = new PaymentService();
