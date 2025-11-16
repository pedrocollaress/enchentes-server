"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Interface para um único pulso
interface Pulse {
  sensor: boolean;
  receivedAt: number;
  humanTime: string;
}

// Interface para a resposta da API
interface ApiResponse {
  message: string;
  pulses: Pulse[];
}

export function ReportsContent() {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  /**
   * Busca os dados da API /api/pulse
   */
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pulse");
      if (!res.ok) {
        throw new Error(`Falha ao buscar dados da API: ${res.statusText}`);
      }

      const data: ApiResponse = await res.json();
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

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Formata a string ISO UTC para uma string de log em Horário de Brasília
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

  // Cálculos de paginação
  const totalPages = Math.ceil(pulses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPulses = pulses.slice(startIndex, endIndex);

  // Funções de navegação
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Estado de Erro
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

            {/* Estado de Carregamento */}
            {isLoading && (
              <div className="space-y-3 pt-3">
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

            {/* Estado "Sem Dados" */}
            {!isLoading && pulses.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum pulso registrado
              </div>
            )}

            {/* Lista de Pulsos Paginados */}
            {!isLoading &&
              currentPulses.map((pulse) => (
                <div
                  key={pulse.receivedAt}
                  className="flex items-center justify-between border-b py-3 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-muted-foreground">
                    {formatLogMessage(pulse.humanTime)}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {formatDateTime(pulse.humanTime)}
                  </span>
                </div>
              ))}
          </div>

          {/* Controles de Paginação */}
          {!isLoading && pulses.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, pulses.length)}{" "}
                de {pulses.length} registros
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                {/* Números das páginas */}
                <div className="flex gap-1 items-center">
                  {(() => {
                    const pages = [];
                    const showEllipsis = totalPages > 5;

                    if (!showEllipsis) {
                      // Se tiver 5 páginas ou menos, mostra todas
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(
                          <Button
                            key={i}
                            variant={currentPage === i ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(i)}
                            className="w-9"
                          >
                            {i}
                          </Button>
                        );
                      }
                    } else {
                      // Sempre mostra a primeira página
                      pages.push(
                        <Button
                          key={1}
                          variant={currentPage === 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(1)}
                          className="w-9"
                        >
                          1
                        </Button>
                      );

                      // Se a página atual for maior que 3, mostra reticências
                      if (currentPage > 3) {
                        pages.push(
                          <span
                            key="ellipsis-start"
                            className="px-2 text-muted-foreground"
                          >
                            ...
                          </span>
                        );
                      }

                      // Mostra páginas ao redor da página atual
                      const startPage = Math.max(2, currentPage - 1);
                      const endPage = Math.min(totalPages - 1, currentPage + 1);

                      for (let i = startPage; i <= endPage; i++) {
                        // Não mostra se for a primeira ou última página (já mostradas)
                        if (i !== 1 && i !== totalPages) {
                          pages.push(
                            <Button
                              key={i}
                              variant={
                                currentPage === i ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => goToPage(i)}
                              className="w-9"
                            >
                              {i}
                            </Button>
                          );
                        }
                      }

                      // Se a página atual estiver longe do final, mostra reticências
                      if (currentPage < totalPages - 2) {
                        pages.push(
                          <span
                            key="ellipsis-end"
                            className="px-2 text-muted-foreground"
                          >
                            ...
                          </span>
                        );
                      }

                      // Sempre mostra a última página
                      pages.push(
                        <Button
                          key={totalPages}
                          variant={
                            currentPage === totalPages ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => goToPage(totalPages)}
                          className="w-9"
                        >
                          {totalPages}
                        </Button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
