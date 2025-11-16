"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Para o loading

// Interface para um único pulso (vinda do seu redis.ts)
interface Pulse {
  sensor: boolean;
  receivedAt: number;
  humanTime: string;
}

// Interface para a resposta da sua API (vinda do seu route.js)
interface ApiResponse {
  message: string;
  pulses: Pulse[];
}

export function ReportsContent() {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca os dados da API /api/pulse
   */
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Faz o GET para a sua rota (que já busca TODOS os pulsos)
      const res = await fetch("/api/pulse");
      if (!res.ok) {
        throw new Error(`Falha ao buscar dados da API: ${res.statusText}`);
      }

      const data: ApiResponse = await res.json();

      // A API já retorna os pulsos ordenados (mais novo primeiro)
      setPulses(data.pulses);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Um erro desconhecido ocorreu"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para buscar dados apenas UMA VEZ quando o componente carregar
  useEffect(() => {
    fetchData();
  }, []); // O array vazio [] garante que isso rode apenas uma vez (no mount)

  // --- Funções Corrigidas de Formatação de Data ---
  // (O v0 estava aplicando o offset -3h manualmente, o que é um bug)

  /**
   * Formata a string ISO UTC para uma string de log em Horário de Brasília
   * Ex: "Pulso registrado às 14:32:05"
   */
  const formatLogMessage = (isoTime: string) => {
    const date = new Date(isoTime);
    const timeString = date.toLocaleTimeString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `Pulso registrado às ${timeString}`;
  };

  /**
   * Formata a string ISO UTC para Data e Hora de Brasília
   * Ex: "16/11/2025, 14:32"
   */
  const formatDateTime = (isoTime: string) => {
    const date = new Date(isoTime);
    return date.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- Estados da UI ---

  // 1. Estado de Erro
  if (error) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <Card className="w-full max-w-lg mx-auto border-destructive bg-destructive/10">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">
              Erro ao Carregar Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Não foi possível buscar os dados da API.
            </p>
            <code className="mt-2 block rounded bg-muted p-2 text-sm text-destructive">
              {error}
            </code>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Estado de Sucesso (com ou sem dados)
  return (
    <div className="flex-1 space-y-6 p-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Relatório de Pulsos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <span className="text-sm font-semibold text-primary">
                Log (Horário de Brasília)
              </span>
              <span className="text-sm font-semibold text-primary">
                Data & Hora (BRT)
              </span>
            </div>

            {/* Logs - Estado de Carregamento */}
            {isLoading && (
              <div className="space-y-3 pt-3">
                {/* Gera 5 linhas de "esqueleto" */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3"
                  >
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            )}

            {/* Logs - Estado "Sem Dados" */}
            {!isLoading && pulses.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum pulso registrado
              </div>
            )}

            {/* Logs - Estado de Sucesso (com dados) */}
            {!isLoading &&
              pulses.map((pulse) => (
                <div
                  key={pulse.receivedAt} // Usa o timestamp como chave única
                  className="flex items-center justify-between border-b py-3 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-muted-foreground">
                    {/* Usa a nova função de formatação */}
                    {formatLogMessage(pulse.humanTime)}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {/* Usa a nova função de formatação */}
                    {formatDateTime(pulse.humanTime)}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
