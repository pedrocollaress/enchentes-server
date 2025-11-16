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
import { Skeleton } from "../components/ui/skeleton";

interface Pulse {
  sensor: boolean;
  receivedAt: number;
  humanTime: string;
}

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
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Apenas primeira carga
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca os dados da API /api/pulse
   */
  const fetchData = async () => {
    try {
      const res = await fetch("/api/pulse");
      if (!res.ok) {
        throw new Error(`Falha ao buscar dados da API: ${res.statusText}`);
      }

      const data: ApiResponse = await res.json();
      setPulses(data.pulses);

      if (data.pulses.length > 0) {
        const mostRecentPulse = new Date(data.pulses[0].humanTime);
        setLastPulseTime(mostRecentPulse);

        const now = new Date();
        const diffInMinutes =
          (now.getTime() - mostRecentPulse.getTime()) / (1000 * 60);

        setIsFloodDanger(diffInMinutes <= 60);
      } else {
        setLastPulseTime(null);
        setIsFloodDanger(false);
      }

      setError(null);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Um erro desconhecido ocorreu"
      );
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const chartData = (() => {
    const today = new Date();
    const fullDayData: Array<{
      time: string;
      hour: number;
      occurrences: number;
      hasData: boolean;
    }> = [];

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

    pulses.forEach((pulse) => {
      const date = new Date(pulse.humanTime);
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

  const totalOccurrences = chartData.reduce(
    (acc, curr) => acc + curr.occurrences,
    0
  );

  if (isInitialLoading) {
    return (
      <div className="flex-1 space-y-6 p-8">
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

  // Estado de Erro
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

  if (pulses.length === 0) {
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
            <p className="text-xs text-muted-foreground mt-2">
              Verificando automaticamente a cada 10 segundos...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estado do Sensor
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
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
