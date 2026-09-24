import { Link } from 'react-router-dom';
import { Clock, Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { PATHS } from '@/Routes/paths';
import { useLanguage } from '@/Hooks/useLanguage';

const ENLACES = {
  es: [
    {
      titulo: 'Explora',
      items: [
        { to: PATHS.calendario, label: 'Calendario' },
        { to: PATHS.espacios, label: 'Espacios' },
        { to: PATHS.boletos, label: 'Boletos' },
        { to: PATHS.reservas, label: 'Reservar espacio' },
      ],
    },
    {
      titulo: 'Cultura',
      items: [
        { to: PATHS.historia, label: 'Historia de Orotina' },
        { to: PATHS.galeria, label: 'Galería Ferrocarril' },
        { to: PATHS.artes, label: 'Teatro · Baile · Canto' },
        { to: PATHS.noticias, label: 'Noticias' },
      ],
    },
    {
      titulo: 'Institucional',
      items: [
        { to: PATHS.login, label: 'Ingresar' },
        { to: PATHS.registro, label: 'Crear cuenta' },
        { to: PATHS.misReservas, label: 'Mis reservas' },
      ],
    },
  ],
  en: [
    {
      titulo: 'Explore',
      items: [
        { to: PATHS.calendario, label: 'Calendar' },
        { to: PATHS.espacios, label: 'Spaces' },
        { to: PATHS.boletos, label: 'Tickets' },
        { to: PATHS.reservas, label: 'Book a space' },
      ],
    },
    {
      titulo: 'Culture',
      items: [
        { to: PATHS.historia, label: 'History of Orotina' },
        { to: PATHS.galeria, label: 'Railway Gallery' },
        { to: PATHS.artes, label: 'Theater · Dance · Song' },
        { to: PATHS.noticias, label: 'News' },
      ],
    },
    {
      titulo: 'Institutional',
      items: [
        { to: PATHS.login, label: 'Log in' },
        { to: PATHS.registro, label: 'Create account' },
        { to: PATHS.misReservas, label: 'My bookings' },
      ],
    },
  ],
  zh: [
    {
      titulo: '探索',
      items: [
        { to: PATHS.calendario, label: '日曆' },
        { to: PATHS.espacios, label: '空間' },
        { to: PATHS.boletos, label: '門票' },
        { to: PATHS.reservas, label: '預約空間' },
      ],
    },
    {
      titulo: '文化',
      items: [
        { to: PATHS.historia, label: '奧羅蒂納歷史' },
        { to: PATHS.galeria, label: '鐵路畫廊' },
        { to: PATHS.artes, label: '戲劇 · 舞蹈 · 歌唱' },
        { to: PATHS.noticias, label: '新聞' },
      ],
    },
    {
      titulo: '機構',
      items: [
        { to: PATHS.login, label: '登入' },
        { to: PATHS.registro, label: '建立帳號' },
        { to: PATHS.misReservas, label: '我的預約' },
      ],
    },
  ],
};

const COPY = {
  es: {
    address: 'Antiguo complejo del Ferrocarril al Pacífico, costado este del Parque de Orotina, Alajuela, Costa Rica.',
    schedule: 'Martes a domingo · 9:00 a. m. – 8:00 p. m.',
    community: 'Plataforma digital comunitaria',
  },
  en: {
    address: 'Old Pacific Railway complex, east side of Orotina Park, Alajuela, Costa Rica.',
    schedule: 'Tuesday to Sunday · 9:00 a.m. – 8:00 p.m.',
    community: 'Community digital platform',
  },
  zh: {
    address: '舊太平洋鐵路綜合體，位於奧羅蒂納公園東側，阿拉胡埃拉，哥斯大黎加。',
    schedule: '週二至週日 · 上午 9:00 – 晚上 8:00',
    community: '社群數位平台',
  },
};

export default function Footer() {
  const { language } = useLanguage();
  const enlaces = ENLACES[language] ?? ENLACES.es;
  const copy = COPY[language] ?? COPY.es;

  return (
    <footer className="border-t border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-800">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">
            Centro Cultural Orotinense
          </h2>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Luis Ferrero Acosta</p>

          <ul className="mt-5 space-y-3 text-sm text-ink-600 dark:text-ink-300">
            <li className="flex gap-2.5">
              <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <span>{copy.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Clock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <span>{copy.schedule}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <a href="tel:+50624120000" className="hover:underline">+506 2412 0000</a>
            </li>
            <li className="flex gap-2.5">
              <Mail aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              <a href="mailto:info@caco.orotina.cr" className="hover:underline">info@caco.orotina.cr</a>
            </li>
          </ul>
        </div>

        {enlaces.map((grupo) => (
          <nav key={grupo.titulo} aria-label={grupo.titulo}>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-800 dark:text-ink-100">
              {grupo.titulo}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {grupo.items.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-ink-600 transition hover:text-brand-600 dark:text-ink-300 dark:hover:text-brand-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-ink-200 dark:border-ink-700">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-ink-500 dark:text-ink-400">
            © {new Date().getFullYear()} Centro Cultural Orotinense. {copy.community}.
          </p>

          <ul className="flex items-center gap-3">
            {[
              { href: 'https://facebook.com', label: 'Facebook', Icon: Facebook },
              { href: 'https://instagram.com', label: 'Instagram', Icon: Instagram },
              { href: 'https://youtube.com', label: 'YouTube', Icon: Youtube },
            ].map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${label} del Centro Cultural Orotinense`}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-ink-200 text-ink-600 transition hover:border-brand-500 hover:text-brand-600 dark:border-ink-700 dark:text-ink-300"
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}