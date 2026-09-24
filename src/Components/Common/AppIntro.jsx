import { useEffect, useState } from 'react';
import { Landmark } from 'lucide-react';

const INTRO_KEY = 'caco.intro-seen';

export default function AppIntro() {
  const [visible, setVisible] = useState(() => {
    try {
      return window.sessionStorage.getItem(INTRO_KEY) !== 'true';
    } catch {
      return true;
    }
  });
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;

    const exitTimer = window.setTimeout(() => setLeaving(true), 760);
    const removeTimer = window.setTimeout(() => {
      setVisible(false);
      try {
        window.sessionStorage.setItem(INTRO_KEY, 'true');
      } catch {
        // La intro puede repetirse si el almacenamiento no está disponible.
      }
    }, 1180);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`app-intro${leaving ? ' app-intro--leaving' : ''}`} role="status" aria-label="Cargando Centro Cultural">
      <div className="app-intro__mark">
        <span className="app-intro__logo">
          <Landmark aria-hidden="true" className="h-8 w-8" />
          <img
            src="/logoOrotina.jpeg"
            alt=""
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
          />
        </span>
        <span className="app-intro__rule" />
        <p>Centro Cultural Orotinense</p>
        <small>Luis Ferrero Acosta</small>
      </div>
    </div>
  );
}
