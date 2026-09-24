export default function SectionTitle({ eyebrow, title, description, align = 'left' }) {
  return (
    <header className={align === 'center' ? 'text-center' : ''}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">{eyebrow}</p>
      )}
      <h2 className="mt-2 font-display text-2xl font-bold text-ink-900 sm:text-3xl dark:text-ink-50">{title}</h2>
      {description && (
        <p className={`mt-3 max-w-2xl text-sm text-ink-600 sm:text-base dark:text-ink-300 ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </header>
  );
}