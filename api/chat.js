export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Mensagem não informada" });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Gemini:", data);
      return res.status(response.status).json({
        error: "Erro ao consultar o Gemini",
        details: data,
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não consegui gerar uma resposta.";

    return res.status(200).json({ response: text });
  } catch (error) {
    console.error("Erro:", error);

    return res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
}