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
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;

    const welcomeTimer = window.setTimeout(() => setShowWelcome(true), 950);
    const exitTimer = window.setTimeout(() => setLeaving(true), 2650);
    const removeTimer = window.setTimeout(() => {
      setVisible(false);
      try {
        window.sessionStorage.setItem(INTRO_KEY, 'true');
      } catch {
        // La intro puede repetirse si el almacenamiento no está disponible.
      }
    }, 1180);

    return () => {
      window.clearTimeout(welcomeTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`app-intro${leaving ? ' app-intro--leaving' : ''}`} role="status" aria-label="Bienvenida al Centro Cultural Orotinense" aria-live="polite">
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
        {showWelcome && (
          <div className="app-intro__welcome">
            <h1>¡Te damos la bienvenida!</h1>
            <p>Un lugar para encontrarnos, crear y celebrar nuestra cultura.</p>
          </div>
        )}
      </div>
    </div>
  );
}
