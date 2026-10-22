import Link from "next/link";

const cards = [
  {
    title: "Gestão de pacientes",
    description:
      "Cadastre, atualize e consulte prontuários clínicos com histórico completo e registro de consentimento LGPD.",
    href: "/patients",
    action: "Acessar pacientes",
  },
  {
    title: "Anamnese dinâmica",
    description:
      "Configure modelos reutilizáveis com perguntas tipadas, pesos de pontuação e histórico preservado por atendimento.",
    href: "/anamnesis",
    action: "Ver modelos",
  },
  {
    title: "Pontuação clínica",
    description:
      "Calcule escores capilares automaticamente a partir das respostas da anamnese, com classificação e detalhamento por item.",
    href: "/scoring",
    action: "Conhecer cálculo",
  },
  {
    title: "Fotos e laudos em PDF",
    description:
      "Organize fotos clínicas (antes, depois e evolução), compare imagens lado a lado e gere relatórios em PDF.",
    href: "/reports",
    action: "Ver relatórios",
  },
];

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
          Visão geral
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Operações clínicas de tricologia
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Acompanhe o fluxo completo da clínica em um único ambiente: cadastro de
          pacientes, preenchimento de anamneses estruturadas, cálculo interpretável de
          pontuação capilar, evolução fotográfica e geração de relatórios em PDF.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.title}
            className="flex flex-col justify-between rounded-[1.75rem] border border-brand-100 bg-white p-6 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-semibold text-brand-900">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {card.description}
              </p>
            </div>
            <div className="mt-5">
              <Link
                href={card.href}
                className="text-sm font-semibold text-brand-700 transition hover:text-brand-900"
              >
                {card.action} →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
