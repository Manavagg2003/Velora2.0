import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/contexts/ThemeContext';
import { paymentService } from '@/services/payment.service';

export default function PaymentWebView() {
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const orderId = String(params.order_id || '');
  const keyId = String(params.key_id || '');
  const amount = String(params.amount || '');
  const tier = String(params.tier || 'plus');

  const html = `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <script>
        const options = {
          key: '${keyId}',
          amount: '${amount}',
          currency: 'INR',
          name: 'Velora',
          description: 'Subscription',
          order_id: '${orderId}',
          handler: function (response){
            window.ReactNativeWebView.postMessage(JSON.stringify({event:'success', data: response}));
          },
          modal: {
            ondismiss: function(){
              window.ReactNativeWebView.postMessage(JSON.stringify({event:'cancel'}));
            }
          },
          theme: { color: '#6C5CE7' }
        };
        const rzp1 = new Razorpay(options);
        rzp1.open();
      </script>
    </body>
  </html>`;

  const onMessage = useCallback(async (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.event === 'success') {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = msg.data;
        await paymentService.verifyPayment({
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          plan_tier: tier as any,
          user_id: '',
        });
        router.replace('/(tabs)/profile');
      } else if (msg.event === 'cancel') {
        router.back();
      }
    } catch (e) {
      router.back();
    }
  }, [tier]);

  return (
    <View style={{ flex:1, backgroundColor: theme.background }}>
      <WebView originWhitelist={["*"]} source={{ html }} onMessage={onMessage} />
    </View>
  );
}


