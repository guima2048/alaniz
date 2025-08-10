/**
 * Utilitários para formatação de datas no horário de São Paulo
 */

export function formatDateSP(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateOnlySP(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function getCurrentYearSP(): number {
  return new Date().toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric'
  }) as unknown as number;
}

export function getCurrentDateSP(): Date {
  return new Date(new Date().toLocaleString('en-US', {
    timeZone: 'America/Sao_Paulo'
  }));
}

export function toISOSPLocal(date: Date): string {
  // Converte para horário de São Paulo e retorna ISO string
  const spDate = new Date(date.toLocaleString('en-US', {
    timeZone: 'America/Sao_Paulo'
  }));
  return spDate.toISOString();
}
