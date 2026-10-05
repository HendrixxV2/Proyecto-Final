import { render, screen } from '@testing-library/react';
import AdminAssistant from '@/Components/AI/AdminAssistant';
import AiAssistant from '@/Components/AI/AiAssistant';
import { AuthContext } from '@/Context/AuthContext';
import { LanguageContext } from '@/Context/LanguageContext';

const renderAdminAssistant = (user) => render(
  <AuthContext.Provider value={{ user }}>
    <AdminAssistant />
  </AuthContext.Provider>,
);

describe('assistant access', () => {
  it('renders the public assistant without a registered user', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <LanguageContext.Provider value={{ language: 'es', t: (key) => key }}>
          <AiAssistant />
        </LanguageContext.Provider>
      </AuthContext.Provider>,
    );

    expect(screen.getByRole('button', { name: 'Lulu-Bot' })).toBeInTheDocument();
  });

  it('hides Lulu Admin from regular users', () => {
    renderAdminAssistant({ id: 2, rol: 'usuario_regular' });

    expect(screen.queryByRole('button', { name: 'Abrir Lulu Admin' })).not.toBeInTheDocument();
  });

  it('shows a round blue assistant button to admins', () => {
    renderAdminAssistant({ id: 1, rol: 'admin' });

    const button = screen.getByRole('button', { name: 'Abrir Lulu Admin' });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('rounded-full');
    expect(button.className).toContain('bg-blue-600');
  });
});