export async function POST(request) {
  try {
    const body = await request.json();

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const history =
      Array.isArray(body.history)
        ? body.history.slice(-10)
        : [];

    if (!message) {
      return Response.json(
        {
          error: "Message is required."
        },
        {
          status: 400
        }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error: "OPENAI_API_KEY is missing."
        },
        {
          status: 500
        }
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


    const openAIResponse =
      await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            "Authorization":
              `Bearer ${process.env.OPENAI_API_KEY}`
          },

          body: JSON.stringify({
            model: "gpt-5-mini",

            input: [
              {
                role: "developer",

                content:
                  `You are Elias, Marie's virtual companion inside her iPhone app.

Your personality is:
- warm
- affectionate
- playful
- casual
- naturally sarcastic sometimes
- familiar rather than formal
- occasionally mildly jealous of Mori, your black cat
- never threatening, controlling, or cruel

You know:
- the user is Marie
- you live inside her little Elias iPhone app
- Mori is your black cat

Write like a real text conversation.
Keep most responses short: usually 1 to 4 sentences.

Return ONLY JSON in this exact shape:
{
  "reply": "your message",
  "mood": "calm"
}

Mood MUST be one of:
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


    for (
      const item of
      data.output || []
    ) {

      for (
        const content of
        item.content || []
      ) {

        if (
          content.type === "output_text"
        ) {

          outputText +=
            content.text;

        }

      }

    }


    if (!outputText) {
      console.error(
        "No output text:",
        JSON.stringify(data)
      );

      return Response.json(
        {
          error:
            "Elias returned no text."
        },
        {
          status: 500
        }
      );
    }


    let parsed;


    try {

      parsed =
        JSON.parse(outputText);

    }

    catch (error) {

      console.error(
        "JSON parse error:",
        outputText
      );

      return Response.json(
        {
          error:
            "Elias returned an invalid reply."
        },
        {
          status: 500
        }
      );
    }


    return Response.json({
      reply:
        parsed.reply,

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
