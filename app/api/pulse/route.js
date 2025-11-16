import { NextResponse } from "next/server";
import { savePulseToDB, getLatestPulses } from "@/app/service/redis";
import { sendEmailAlert } from "@/app/service/email";

/**
 * @route POST /api/pulse
 * @desc Recebe um pulso (POST) do sensor NodeMCU
 */
export async function POST(req) {
  try {
    const body = await req.json();

    if (body.sensor === "true") {
      console.log(
        "[PULSE API] Payload valido. Tentando salvar no banco de dados..."
      );

      sendEmailAlert();
      const dbResult = await savePulseToDB(true);

      if (!dbResult.success) {
        console.error("[PULSE API] Falha ao salvar no DB:", dbResult.error);
        return NextResponse.json(
          { error: "Falha ao salvar no banco de dados" },
          { status: 500 }
        );
      }

      console.log("[PULSE API] Pulso salvo com sucesso.");
      return NextResponse.json(
        { message: "Pulso recebido e salvo!" },
        { status: 200 }
      );
    } else {
      console.warn(
        "[PULSE API] Payload recebido, mas formato inesperado:",
        body
      );
      return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
    }
  } catch (error) {
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
  try {
    const pulses = await getLatestPulses(10);

    return NextResponse.json(
      {
        message: "Mostrando os 10 últimos pulsos recebidos.",
        pulses: pulses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PULSE API] Erro ao buscar pulsos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pulsos", details: error.message },
      { status: 500 }
    );
  }
}
