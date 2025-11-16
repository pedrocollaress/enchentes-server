import { createClient } from "redis";

// A conexão está correta
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

let isConnected = false;

async function connectToRedis() {
  if (isConnected) {
    return;
  }
  try {
    await redisClient.connect();
    isConnected = true;
    console.log("[Redis Service] Conectado ao Vercel Redis (via 'redis').");
  } catch (err) {
    console.error("[Redis Service] FALHA AO CONECTAR no Redis:", err);
    isConnected = false;
  }
}

// Interface (correta)
interface PulseData {
  sensor: boolean;
  receivedAt: number;
  humanTime: string;
}

// savePulseToDB (está correto, sem mudanças)
export async function savePulseToDB(sensorStatus: boolean) {
  try {
    await connectToRedis();

    const receivedAt = Date.now();
    const pulseData: PulseData = {
      sensor: sensorStatus,
      receivedAt: receivedAt,
      humanTime: new Date(receivedAt).toISOString(),
    };
    const dataString = JSON.stringify(pulseData);

    await redisClient.zAdd("pulses:log", {
      score: receivedAt,
      value: dataString,
    });

    console.log("[Redis Service] Pulso salvo com sucesso (via 'redis').");
    return { success: true };
  } catch (error) {
    console.error("[Redis Service] Erro ao salvar no Redis:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * (Bônus) Função para buscar os últimos pulsos salvos
 * (A assinatura da função é a mesma, seu route.js não precisa mudar)
 *
 * @param {number} count - Quantidade de pulsos para buscar
 * @returns {Promise<PulseData[]>}
 */
export async function getLatestPulses(count = 10): Promise<PulseData[]> {
  try {
    await connectToRedis();

    // --- CORREÇÃO 1: Tipamos a declaração (como você sugeriu) ---
    // Dizemos ao TypeScript: "Confie em nós, isso vai ser um array de strings ou nulo"
    const rawPulses = (await redisClient.zRange("pulses:log", -count, -1, {
      REV: true,
    })) as string[] | null;

    // --- CORREÇÃO 2: Verificação de Nulo/Vazio ---
    // Esta verificação agora funciona, pois o TS sabe que rawPulses
    // (se não for nulo) é um array e, portanto, TEM a propriedade .length.
    if (!rawPulses || rawPulses.length === 0) {
      console.log("[Redis Service] Nenhum pulso encontrado em 'pulses:log'.");
      return []; // Retorna um array vazio com segurança
    }

    // --- CORREÇÃO 3: 'map' ---
    // Como o TS agora sabe que rawPulses é string[],
    // ele infere automaticamente 'member' como 'string'.
    // O erro "implicitly has an 'any' type" desaparece.
    const pulses = rawPulses.map((member) => JSON.parse(member));

    return pulses; // Já vem na ordem correta (mais novo primeiro)
  } catch (error) {
    console.error("[Redis Service] Erro ao buscar pulsos:", error);
    return [];
  }
}
