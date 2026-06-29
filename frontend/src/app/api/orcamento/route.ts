import { NextResponse } from "next/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const API_TOKEN = process.env.STRAPI_API_TOKEN;

/**
 * Recebe o formulário de orçamento, descarta bots (honeypot) e encaminha ao Strapi.
 * Rodar no servidor mantém o token fora do navegador e centraliza a validação.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  // Honeypot: se o campo oculto veio preenchido, é bot. Fingimos sucesso e ignoramos.
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  if (!body.nome || !body.contato) {
    return NextResponse.json(
      { error: "Nome e contato são obrigatórios" },
      { status: 400 }
    );
  }

  const payload = {
    data: {
      nome: String(body.nome).slice(0, 200),
      contato: String(body.contato).slice(0, 200),
      tipoEvento: body.tipoEvento || undefined,
      dataEvento: body.dataEvento || undefined,
      mensagem: body.mensagem ? String(body.mensagem).slice(0, 2000) : undefined,
      // status fica como "novo" (default do content type)
    },
  };

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (API_TOKEN) headers.Authorization = `Bearer ${API_TOKEN}`;

  const res = await fetch(`${STRAPI_URL}/api/solicitacoes-orcamento`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Falha ao registrar a solicitação" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
