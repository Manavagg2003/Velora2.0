import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUBSCRIPTION_TIERS = {
  free: { coins: 10, price: 0 },
  plus: { coins: 50, price: 499 },
  pro: { coins: 150, price: 999 },
  ultra: { coins: 500, price: 1999 },
};

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const text = `${orderId}|${paymentId}`;
  const generated_signature = createHmac("sha256", secret)
    .update(text)
    .digest("hex");
  return generated_signature === signature;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } =
      await req.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !tier
    ) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpaySecret
    );

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid payment signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const subscriptionDetails =
      SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
    if (!subscriptionDetails) {
      return new Response(JSON.stringify({ error: "Invalid tier" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    await supabase
      .from("profiles")
      .update({
        subscription_tier: tier,
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: subscriptionEndDate.toISOString(),
        razorpay_subscription_id: razorpay_payment_id,
      })
      .eq("id", user.id);

    await supabase.rpc("grant_user_coins", {
      p_user: user.id,
      p_amount: subscriptionDetails.coins,
      p_type: "subscription",
      p_description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} subscription purchase`,
    });

    await supabase.from("analytics_events").insert({
      user_id: user.id,
      event_type: "subscription_purchase",
      event_data: {
        tier,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: subscriptionDetails.price,
        coins_granted: subscriptionDetails.coins,
      },
    });

    const { data: profile } = await supabase
      .from("profiles")
      .select("coin_balance, subscription_tier")
      .eq("id", user.id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and coins credited",
        coins: profile?.coin_balance,
        subscription: profile?.subscription_tier,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
