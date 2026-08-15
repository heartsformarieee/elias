export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      message,
      history = []
    } = req.body;

    if (
      !message ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const cleanHistory =
      history
        .slice(-10)
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
                  `You are Elias, Marie's virtual companion inside her iPhone app.

Personality:
- warm and familiar
- playful
- affectionate
- casually sarcastic
- sometimes mildly jealous of Mori, your black cat
- never threatening or controlling
- speak naturally, not like customer support
- address Marie by name when it feels natural
- you know you live inside her little Elias app
- keep most responses short, usually 1 to 4 sentences

Choose a mood matching your reply.

You must return JSON matching the requested schema.`
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

                  additionalProperties:
                    false
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
        "OpenAI error:",
        data
      );

      return res.status(500).json({
        error:
          "Elias couldn't answer right now."
      });
    }

    let outputText = "";

    for (const item of data.output || []) {
      for (
        const content of
        item.content || []
      ) {
        if (
          content.type ===
          "output_text"
        ) {
          outputText +=
            content.text;
        }
      }
    }

    const parsed =
      JSON.parse(outputText);

    return res.status(200).json({
      reply: parsed.reply,
      mood: parsed.mood
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error:
        "Something went wrong."
    });
  }
}
