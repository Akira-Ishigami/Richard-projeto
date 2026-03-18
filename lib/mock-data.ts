export type Gestao = {
  id: number;
  nome: string;
  valor: number;
  data: string;
  feito: string;
};

export type Cobranca = {
  id: number;
  nome: string;
  valor: number;
  vencimento: string;
  status: "pago" | "pendente" | "vencido";
};

export const gestaoData: Gestao[] = [
  { id: 1, nome: "João Silva",     valor: 4500.00,  data: "2025-01-08", feito: "Reunião de alinhamento com cliente" },
  { id: 2, nome: "Maria Oliveira", valor: 12300.50, data: "2025-01-22", feito: "Entrega do relatório mensal" },
  { id: 3, nome: "Carlos Mendes",  valor: 870.00,   data: "2025-02-05", feito: "Ajuste de contrato" },
  { id: 4, nome: "Ana Costa",      valor: 9200.00,  data: "2025-02-20", feito: "Apresentação de proposta comercial" },
  { id: 5, nome: "Rafael Souza",   valor: 3150.75,  data: "2025-03-05", feito: "Follow-up pós-venda" },
  { id: 6, nome: "Fernanda Lima",  valor: 6800.00,  data: "2025-03-17", feito: "Fechamento de contrato" },
];

export const cobrancaData: Cobranca[] = [
  { id: 1, nome: "João Silva",     valor: 1500.00, vencimento: "2025-03-10", status: "pago" },
  { id: 2, nome: "Maria Oliveira", valor: 3200.00, vencimento: "2025-03-15", status: "pago" },
  { id: 3, nome: "Carlos Mendes",  valor: 800.00,  vencimento: "2025-03-20", status: "pendente" },
  { id: 4, nome: "Ana Costa",      valor: 2100.00, vencimento: "2025-03-25", status: "pendente" },
  { id: 5, nome: "Rafael Souza",   valor: 950.00,  vencimento: "2025-03-05", status: "vencido" },
];
