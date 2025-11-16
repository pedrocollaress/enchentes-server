import { kv } from "@vercel/kv"; // Importa o cliente oficial do Vercel KV

interface PulseData {
  sensor: boolean;
  receivedAt: number;
  humanTime: string;
}

/**
 * Salva um registro de pulso no Vercel KV (Redis).
 * Os dados são salvos em um "Sorted Set" (conjunto ordenado) chamado 'pulses:log'
 *
 * @param {boolean} sensorStatus - O status do sensor (true)
 * @returns {Promise<{success: boolean, error?: string}>} - Retorna se a operação foi bem-sucedida
 */
export async function savePulseToDB(sensorStatus: boolean) {
  try {
    const receivedAt = Date.now();

    const pulseData: PulseData = {
      sensor: sensorStatus,
      receivedAt: receivedAt,
      humanTime: new Date(receivedAt).toISOString(), // Formato legível
    };

    const dataString = JSON.stringify(pulseData);

    // 4. Salva no Vercel KV
    // Usamos 'zadd' (Sorted Set) para manter os logs ordenados pelo timestamp
    // O 'score' é o timestamp, usado para ordenação
    // O 'member' é o dado em si
    await kv.zadd("pulses:log", { score: receivedAt, member: dataString });

    console.log("[Redis Service] Pulso salvo com sucesso no KV.");
    return { success: true };
  } catch (error) {
    console.error("[Redis Service] Erro ao salvar no Vercel KV:", error);
    // Garante que 'error' seja uma string
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * (Bônus) Função para buscar os últimos pulsos salvos
 * Seu GET em route.js pode usar isso.
 *
 * @param {number} count - Quantidade de pulsos para buscar
 * @returns {Promise<PulseData[]>} - Uma lista dos últimos pulsos
 */
export async function getLatestPulses(count = 10): Promise<PulseData[]> {
  try {
    // Busca os últimos 'count' items (os de maior score)
    // 'rev: true' significa ordem reversa (do maior para o menor score)
    const rawPulses = await kv.zrange("pulses:log", -count, -1, { rev: true });

    // Parseia os membros (que são strings JSON) de volta para objetos
    const pulses = rawPulses.map((member) => JSON.parse(member as string));
    return pulses;
  } catch (error) {
    console.error("[Redis Service] Erro ao buscar pulsos:", error);
    return [];
  }
}
