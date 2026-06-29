"use client";

import { useState } from "react";

type Estado = "idle" | "enviando" | "ok" | "erro";

/** Formulário de orçamento de eventos (RF-005). Envia para /api/orcamento. */
export function FormularioOrcamento() {
  const [estado, setEstado] = useState<Estado>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");
    const form = event.currentTarget;
    const dados = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/orcamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error("falha");
      setEstado("ok");
      form.reset();
    } catch {
      setEstado("erro");
    }
  }

  if (estado === "ok") {
    return (
      <p className="form-sucesso">
        Recebemos seu pedido de orçamento! Em breve entraremos em contato.
      </p>
    );
  }

  return (
    <form className="form-orcamento" onSubmit={onSubmit}>
      {/* Honeypot: campo oculto. Humano não preenche; bot sim → descartamos no servidor. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hp"
      />

      <label>
        Nome
        <input name="nome" required />
      </label>

      <label>
        Contato (telefone ou e-mail)
        <input name="contato" required />
      </label>

      <label>
        Tipo de evento
        <select name="tipoEvento" defaultValue="">
          <option value="" disabled>
            Selecione…
          </option>
          <option value="casamento">Casamento</option>
          <option value="aniversario">Aniversário</option>
          <option value="corporativo">Corporativo</option>
          <option value="formatura">Formatura</option>
          <option value="outro">Outro</option>
        </select>
      </label>

      <label>
        Data do evento
        <input type="date" name="dataEvento" />
      </label>

      <label>
        Mensagem
        <textarea name="mensagem" rows={4} />
      </label>

      <button type="submit" disabled={estado === "enviando"}>
        {estado === "enviando" ? "Enviando…" : "Solicitar orçamento"}
      </button>

      {estado === "erro" && (
        <p className="form-erro">Não foi possível enviar agora. Tente novamente.</p>
      )}
    </form>
  );
}
