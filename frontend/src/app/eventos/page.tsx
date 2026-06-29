import type { Metadata } from "next";
import { FormularioOrcamento } from "@/components/FormularioOrcamento";

export const metadata: Metadata = {
  title: "Decoração de Eventos",
  description:
    "Decoração floral para casamentos, formaturas e eventos corporativos em Fortaleza. Solicite um orçamento.",
};

export default function EventosPage() {
  return (
    <div className="eventos">
      <header className="page-head">
        <h1>Decoração de Eventos</h1>
        <p>
          Casamentos, formaturas e eventos corporativos. Conte o que você imagina e
          enviaremos um orçamento sem compromisso.
        </p>
      </header>

      <FormularioOrcamento />
    </div>
  );
}
