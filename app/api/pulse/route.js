export default function handler(req, res) {
  if (req.method === "POST") {
    // O pulso foi recebido!

    // O corpo da mensagem que enviamos ("{\"status\":\"DETECTADO\"}")
    const body = req.body;

    console.log("PULSO RECEBIDO:", body);

    // AQUI você faz sua mágica:
    // 1. Salva em um banco de dados (Vercel KV, Supabase, etc)
    // 2. Envia um WebSocket para os clientes (browsers)
    // 3. Dispara um alerta

    // Responde ao NodeMCU que deu tudo certo
    res.status(200).json({ message: "Pulso recebido com sucesso!" });
  } else {
    // Se tentarem acessar via GET (browser)
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
