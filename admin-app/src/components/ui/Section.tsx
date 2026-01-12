interface SectionProps {
  readonly title: string;
  readonly children: React.ReactNode;
}

export function Section({ title, children }: Readonly<SectionProps>) {
  return (
    <section className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-base font-semibold text-bcgov-gray-dark m-0 px-4 py-3 border-b border-gray-200">
        {title}
      </h2>
      <div className="p-4">{children}</div>
    </section>
  );
}
