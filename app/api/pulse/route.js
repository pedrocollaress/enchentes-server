import { NextResponse } from "next/server";

/**
 * @route POST /api/pulse
 * @desc Recebe um pulso (POST) do sensor NodeMCU
 */
export async function POST(req) {
  try {
    // 1. Parse o JSON enviado pelo NodeMCU
    // O Next.js já faz o parse automático do body
    const body = await req.json();

    // 2. Log o que foi recebido (você verá isso nos logs da Vercel)
    console.log("[PULSE API] Pulso recebido:", body);

    // 3. Verifique o payload (opcional, mas bom)
    // Nota: O NodeMCU enviou "true" como string, não como booleano
    if (body.sensor === "true" && body.timestamp) {
      // Converte o timestamp (que é uptime em ms) para algo legível no log
      const uptimeMs = body.timestamp;
      console.log(
        `[PULSE API] Sensor ativado. Uptime do dispositivo: ${uptimeMs} ms`
      );

      // --- É AQUI QUE VOCÊ FAZ A MÁGICA ---
      // 1. Salve no seu banco de dados (Vercel KV, Supabase, MongoDB...)
      //    ex: await kv.set(`pulse:${Date.now()}`, body);
      //
      // 2. Envie uma notificação via WebSocket para os clientes (browsers)
      //    (usando um serviço como Pusher, Ably, ou seu próprio server)
      //
      // 3. Dispare um alerta (Pushover, Email, etc.)
      // ------------------------------------
    } else {
      // Se o JSON veio mal formatado
      console.warn(
        "[PULSE API] Payload recebido, mas formato inesperado:",
        body
      );
      return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
    }

    // 4. Responda ao NodeMCU que deu tudo certo
    // O NodeMCU verá "Código 200" no Serial Monitor
    return NextResponse.json(
      { message: "Pulso recebido com sucesso!", data: body },
      { status: 200 }
    );
  } catch (error) {
    // Se o req.json() falhar (ex: corpo vazio ou não-JSON)
    console.error("[PULSE API] Erro ao processar o request:", error);
    return NextResponse.json(
      { error: "Erro no servidor", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * @route GET /api/pulse
 * @desc Apenas para testar se a rota está no ar pelo navegador
 */
export async function GET() {
  // Retorna uma mensagem simples para quem acessar a URL no browser
  return NextResponse.json(
    { message: "API de pulso esta no ar. Use POST para enviar dados." },
    { status: 200 }
  );
}
