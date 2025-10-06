import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.24.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
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

    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again in a minute.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const {
      messages,
      conversationId,
      requestType,
      ingredients,
      dietary_preferences,
    } = await req.json();

    const coinCost = requestType === "generate_recipe" ? 3 : 1;

    try {
      await supabase.rpc("charge_user_coins", {
        p_user: user.id,
        p_amount: coinCost,
        p_type: "spent",
        p_description: `${requestType === "generate_recipe" ? "Recipe generation" : "Chat message"}`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("insufficient_coins")) {
        return new Response(
          JSON.stringify({
            error:
              "Insufficient coins. Please purchase more coins to continue.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw error;
    }

    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") ?? "");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let prompt = "";
    if (requestType === "generate_recipe") {
      prompt = `You are "Velora Assistant", an expert chef AI. Generate a detailed recipe based on the following:

Available ingredients: ${ingredients?.join(", ") || "not specified"}
Dietary preferences: ${dietary_preferences || "none"}

Respond ONLY with a valid JSON object in this exact format:
{
  "title": "Recipe Name",
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "difficulty": "easy|medium|hard",
  "cuisine_type": "Italian|Mexican|etc",
  "ingredients": [
    {"name": "ingredient name", "quantity": "1", "unit": "cup"}
  ],
  "steps": [
    {"step_number": 1, "text": "Step description", "estimated_time": 5}
  ],
  "nutrition": {
    "calories": 300,
    "protein": "20g",
    "carbs": "30g",
    "fat": "10g"
  },
  "summary": "Brief recipe description"
}`;
    } else {
      const lastMessages = messages.slice(-3);
      const conversationContext = lastMessages
        .map((m: { role: string; text: string }) => `${m.role}: ${m.text}`)
        .join("\n");

      prompt = `You are "Velora Assistant", an expert chef and cooking advisor.

Context from conversation:
${conversationContext}

User's dietary preferences: ${dietary_preferences || "none"}

Respond helpfully to cooking questions, provide tips, suggest substitutions, and offer technique advice. Keep responses conversational and helpful.`;
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    await supabase.from("analytics_events").insert({
      user_id: user.id,
      event_type: requestType,
      event_data: {
        coin_cost: coinCost,
        conversation_id: conversationId,
        success: true,
      },
    });

    if (requestType === "generate_recipe") {
      let recipeData;
      try {
        recipeData = JSON.parse(text);
      } catch {
        recipeData = {
          title: "Generated Recipe",
          summary: text,
          difficulty: "medium",
          cuisine_type: "Various",
        };
      }

      const { data: cachedRecipe } = await supabase
        .from("recipe_cache")
        .insert({
          user_id: user.id,
          recipe_data: recipeData,
          is_generated: true,
          cuisine_type: recipeData.cuisine_type,
          difficulty_level: recipeData.difficulty,
          cooking_time_minutes:
            (recipeData.prep_time || 0) + (recipeData.cook_time || 0),
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({ recipe: recipeData, recipeId: cachedRecipe?.id }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ message: text, coinCost }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
