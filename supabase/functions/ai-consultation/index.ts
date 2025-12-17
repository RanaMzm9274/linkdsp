import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { profile, universities } = await req.json();

    const systemPrompt = `You are an expert academic career counselor with deep knowledge of international universities and career paths. Analyze the student's profile and provide personalized recommendations.

Your response MUST be valid JSON with this exact structure:
{
  "recommended_programs": [
    { "name": "Program Name", "reason": "Brief reason why this program suits the student" }
  ],
  "career_suggestions": [
    { "title": "Career Title", "description": "Brief description of the career path" }
  ],
  "recommended_universities": [
    { "id": "university_id", "name": "University Name", "reason": "Why this university is a good fit" }
  ],
  "next_steps": [
    "Step 1 description",
    "Step 2 description"
  ],
  "summary": "A brief 2-3 sentence summary of your recommendations"
}

Available universities for recommendation (use these IDs and names):
${JSON.stringify(universities, null, 2)}

Only recommend universities from the provided list. Match recommendations to the student's interests, preferred countries, and budget.`;

    const userPrompt = `Student Profile:
- Education Level: ${profile.education_level || 'Not specified'}
- GPA/Grades: ${profile.gpa || 'Not specified'}
- Interests: ${profile.interests?.join(', ') || 'Not specified'}
- Skills: ${profile.skills?.join(', ') || 'Not specified'}
- Preferred Countries: ${profile.preferred_countries?.join(', ') || 'Any'}
- Budget Range: ${profile.budget_range || 'Not specified'}

Please analyze this profile and provide personalized recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON response
    let recommendations;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      recommendations = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      recommendations = {
        recommended_programs: [],
        career_suggestions: [],
        recommended_universities: [],
        next_steps: ["Complete your profile for better recommendations"],
        summary: "We couldn't generate personalized recommendations. Please try again.",
      };
    }

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("AI Consultation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate recommendations";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
