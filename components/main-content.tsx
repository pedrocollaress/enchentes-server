"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ChartContainer, ChartTooltip } from "../components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Dot,
} from "recharts";
import { AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton"; // Para o estado de loading

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

/**
 * Componente principal que busca dados da API /api/pulse e renderiza o dashboard.
 */
export function MainContent() {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [isFloodDanger, setIsFloodDanger] = useState(false);
  const [lastPulseTime, setLastPulseTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca os dados da API /api/pulse
   */
  const fetchData = async () => {
    try {
      const res = await fetch("/api/pulse"); // Faz o GET para a sua rota
      if (!res.ok) {
        throw new Error(`Falha ao buscar dados da API: ${res.statusText}`);
      }

      const data: ApiResponse = await res.json();

      setPulses(data.pulses);

      // Lógica de status (baseada nos dados reais)
      if (data.pulses.length > 0) {
        // Pega o pulso mais recente (a API já retorna ordenado)
        const mostRecentPulse = new Date(data.pulses[0].humanTime);
        setLastPulseTime(mostRecentPulse);

        // Compara o tempo UTC do pulso com o tempo UTC de agora
        const now = new Date();
        const diffInMinutes =
          (now.getTime() - mostRecentPulse.getTime()) / (1000 * 60);

        // Se o último pulso foi nos últimos 60 minutos, estamos em perigo
        setIsFloodDanger(diffInMinutes <= 60);
      } else {
        // Se não há pulsos, estamos seguros
        setLastPulseTime(null);
        setIsFloodDanger(false);
      }

      setError(null); // Limpa erros anteriores se a busca for bem-sucedida
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Um erro desconhecido ocorreu"
      );
    } finally {
      setIsLoading(false); // Termina o carregamento (seja com sucesso ou erro)
    }
  };

  // Efeito para buscar dados no mount e configurar um "poll" (busca periódica)
  useEffect(() => {
    fetchData(); // Busca os dados imediatamente

    // Configura um intervalo para buscar os dados a cada 10 segundos
    const intervalId = setInterval(fetchData, 10000); // 10000ms = 10 segundos

    // Função de "limpeza" do React: cancela o intervalo se o componente for "desmontado"
    return () => clearInterval(intervalId);
  }, []); // O array vazio [] garante que isso rode apenas uma vez (no mount)

  /**
   * Processa os pulsos para o formato do gráfico (24h)
   */
  const chartData = (() => {
    const today = new Date();
    const fullDayData: Array<{
      time: string;
      hour: number;
      occurrences: number;
      hasData: boolean;
    }> = [];

    // 1. Cria 24 pontos (um para cada hora do dia)
    for (let hour = 0; hour < 24; hour++) {
      const timePoint = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        hour,
        0,
        0
      );

      fullDayData.push({
        time: timePoint.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        hour: hour,
        occurrences: 0,
        hasData: false,
      });
    }

    // 2. Mapeia os pulsos para os pontos de hora correspondentes (Horário de Brasília)
    pulses.forEach((pulse) => {
      const date = new Date(pulse.humanTime);

      // Converte a data UTC para o fuso de Brasília (BRT/AMT)
      const brtDate = new Date(
        date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );

      const hour = brtDate.getHours();
      const dayMatch =
        brtDate.getDate() === today.getDate() &&
        brtDate.getMonth() === today.getMonth() &&
        brtDate.getFullYear() === today.getFullYear();

      if (dayMatch && hour >= 0 && hour < 24) {
        fullDayData[hour].occurrences += 1;
        fullDayData[hour].hasData = true;
      }
    });

    return fullDayData;
  })();

  // CORREÇÃO: Calcula o total de ocorrências de HOJE (não o total dos 10 últimos)
  const totalOccurrences = chartData.reduce(
    (acc, curr) => acc + curr.occurrences,
    0
  );

  // --- Estados da UI ---

  // 1. Estado de Carregamento (Loading)
  // Mostra "esqueletos" (skeletons) na primeira carga
  if (isLoading && pulses.length === 0) {
    return (
      <div className="flex-1 space-y-6 p-8">
        {/* Skeleton loaders para os cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-2/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/5" />
              <Skeleton className="h-3 w-3/5 mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-2/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/5" />
              <Skeleton className="h-3 w-3/5 mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-2/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-3/5" />
              <Skeleton className="h-3 w-3/5 mt-1" />
            </CardContent>
          </Card>
        </div>
        {/* Skeleton para o gráfico */}
        <Card className="col-span-full">
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Estado de Erro
  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-8">
        <Card className="w-full max-w-md border-destructive bg-destructive/10">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">
              Erro ao Carregar Dados
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

  // 3. Estado de "Sem Dados" (depois de carregar)
  if (!isLoading && pulses.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <Activity className="h-6 w-6 text-muted-foreground" />
            <CardTitle>Nenhum Pulso Registrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Ainda não recebemos nenhum pulso do sensor. Aguardando dados...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. Estado de Sucesso (Dashboard Principal)
  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Cards de Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estado do Sensor
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* CORREÇÃO: Mostra o total de pulsos de HOJE */}
            <div className="text-2xl font-bold">{totalOccurrences}</div>
            <p className="text-xs text-muted-foreground">
              Pulsos registrados hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alerta de Enchente
            </CardTitle>
            {isFloodDanger ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                isFloodDanger ? "text-destructive" : "text-green-500"
              }`}
            >
              {isFloodDanger ? "Perigo" : "Seguro"}
            </div>
            <p className="text-xs text-muted-foreground">
              {/* CORREÇÃO: Não aplica mais o offset -3h aqui, pois 'toLocaleTimeString' já cuida disso */}
              {lastPulseTime
                ? `Último pulso: ${lastPulseTime.toLocaleTimeString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  })}`
                : "Nenhum pulso registrado"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Última Atualização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {/* CORREÇÃO: Não aplica mais o offset -3h aqui */}
              {lastPulseTime
                ? lastPulseTime.toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--/--/-- --:--"}
            </div>
            <p className="text-xs text-muted-foreground">
              Horário de Brasília (UTC-3)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Ocorrências de Pulsos ao Longo do Dia</CardTitle>
          <CardDescription>
            Visualização das ocorrências das 00:00 às 23:59 de hoje (Horário de
            Brasília)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ChartContainer
            config={{
              occurrences: {
                label: "Ocorrências",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorOccurrences"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="time"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  interval={2}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Horário
                              </span>
                              <span className="font-bold text-foreground">
                                {data.time}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Ocorrências
                              </span>
                              <span className="font-bold">
                                {data.occurrences}{" "}
                                {data.occurrences === 1 ? "pulso" : "pulsos"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="stepAfter"
                  dataKey="occurrences"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#colorOccurrences)"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    if (payload.hasData && payload.occurrences > 0) {
                      return (
                        <Dot
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill="hsl(var(--chart-1))"
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        />
                      );
                    }
                    return <></>;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
