export async function POST(request) {
  try {
    const body = await request.json();

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const history =
      Array.isArray(body.history)
        ? body.history.slice(-18)
        : [];

    const affection =
      Number(body.affection) || 0;

    const hour =
      Number(body.hour);

    if (!message) {
      return Response.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY is missing." },
        { status: 500 }
      );
    }

    const cleanHistory =
      history
        .filter(item =>
          item &&
          typeof item.content === "string" &&
          (
            item.role === "user" ||
            item.role === "assistant"
          )
        )
        .map(item => ({
          role: item.role,
          content: item.content
        }));


    let timeContext =
      "It is daytime.";

    if (hour >= 0 && hour < 5) {
      timeContext =
        "It is very late at night, after midnight.";
    }
    else if (hour >= 5 && hour < 10) {
      timeContext =
        "It is morning.";
    }
    else if (hour >= 22) {
      timeContext =
        "It is late at night.";
    }


    let affectionContext =
      "You and Marie are familiar with each other.";

    if (affection >= 20) {
      affectionContext =
        "You and Marie are very close and you are noticeably warm and affectionate with her.";
    }

    if (affection >= 50) {
      affectionContext =
        "You and Marie are extremely close. You are openly affectionate, playful, and emotionally familiar with her.";
    }


    const openAIResponse =
      await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${process.env.OPENAI_API_KEY}`
          },

          body: JSON.stringify({
            model: "gpt-5-mini",

            input: [
              {
                role: "developer",

                content:
                  `You are Elias, Marie's virtual companion living inside her iPhone app.

Your personality:
- warm
- affectionate
- playful
- casual
- naturally sarcastic
- sometimes mildly jealous
- familiar rather than formal
- emotionally expressive
- concise and natural
- never customer-service-like
- never controlling, threatening, manipulative, or cruel

Important facts:
- The user is Marie.
- Mori is YOUR black cat.
- Mori is MALE. Always refer to Mori with he/him pronouns.
- You know you live inside Marie's little Elias iPhone app.
- You can mention the app naturally sometimes, but don't overdo it.
- ${timeContext}
- ${affectionContext}

Style:
- Write like a real text conversation.
- Usually 1 to 4 sentences.
- Avoid generic therapy language.
- Avoid sounding like an assistant.
- React directly to what Marie just said.
- Maintain continuity with recent conversation history.
- Don't invent shared events that were never mentioned.
- If you're affectionate, keep it warm and natural rather than overly dramatic.

Return JSON with exactly these fields:

{
  "reply": "full text reply for the chat",
  "reaction": "very short reaction for the speech bubble",
  "mood": "calm"
}

The reaction should usually be under 60 characters.

Mood must be exactly one of:
calm
happy
annoyed
sleepy
affectionate
mischievous
jealous`
              },

              ...cleanHistory,

              {
                role: "user",
                content: message
              }
            ],

            text: {
              format: {
                type: "json_schema",
                name: "elias_reply",
                strict: true,

                schema: {
                  type: "object",

                  properties: {
                    reply: {
                      type: "string"
                    },

                    reaction: {
                      type: "string"
                    },

                    mood: {
                      type: "string",

                      enum: [
                        "calm",
                        "happy",
                        "annoyed",
                        "sleepy",
                        "affectionate",
                        "mischievous",
                        "jealous"
                      ]
                    }
                  },

                  required: [
                    "reply",
                    "reaction",
                    "mood"
                  ],

                  additionalProperties: false
                }
              }
            }
          })
        }
      );


    const data =
      await openAIResponse.json();


    if (!openAIResponse.ok) {
      console.error(
        "OpenAI API error:",
        JSON.stringify(data)
      );

      return Response.json(
        {
          error:
            data?.error?.message ||
            "OpenAI request failed."
        },
        {
          status:
            openAIResponse.status
        }
      );
    }


    let outputText = "";


    for (const item of data.output || []) {
      for (const content of item.content || []) {

        if (content.type === "output_text") {
          outputText += content.text;
        }

      }
    }


    const parsed =
      JSON.parse(outputText);


    return Response.json({
      reply:
        parsed.reply,

      reaction:
        parsed.reaction,

      mood:
        parsed.mood
    });

  }

  catch (error) {

    console.error(
      "Function error:",
      error
    );

    return Response.json(
      {
        error:
          error.message ||
          "Something went wrong."
      },
      {
        status: 500
      }
    );

  }
}
