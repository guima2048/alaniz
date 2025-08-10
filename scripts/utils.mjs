/**
 * Utilitários para scripts - horário de São Paulo
 */

export function getCurrentDateSP() {
  return new Date(new Date().toLocaleString('en-US', {
    timeZone: 'America/Sao_Paulo'
  }));
}

export function toISOSPLocal(date = new Date()) {
  const spDate = new Date(date.toLocaleString('en-US', {
    timeZone: 'America/Sao_Paulo'
  }));
  return spDate.toISOString();
}

export function formatDateSP(date) {
  return new Date(date).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}
