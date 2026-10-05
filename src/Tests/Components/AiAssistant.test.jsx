import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AiAssistant from '@/Components/AI/AiAssistant';
import { LanguageContext } from '@/Context/LanguageContext';
import { aiService } from '@/Services/aiService';

jest.mock('@/Services/aiService', () => ({
  aiService: { chatWorkflow: jest.fn() },
}));

const renderAssistant = () => render(
  <LanguageContext.Provider value={{ language: 'es', t: (key) => key }}>
    <AiAssistant />
  </LanguageContext.Provider>,
);

describe('AiAssistant conversation', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('shows typing, sends the current question, and persists the conversation', async () => {
    const user = userEvent.setup();
    let resolveReply;
    aiService.chatWorkflow.mockReturnValueOnce(new Promise((resolve) => {
      resolveReply = resolve;
    }));
    const { unmount } = renderAssistant();

    await user.click(screen.getByRole('button', { name: 'Lulu-Bot' }));
    await user.type(screen.getByRole('textbox', { name: 'Escribe tu consulta al asistente cultural' }), '¿Qué eventos hay?');
    await user.click(screen.getByRole('button', { name: 'Enviar consulta' }));

    expect(screen.getByRole('status')).toHaveTextContent('Escribiendo…');
    expect(aiService.chatWorkflow).toHaveBeenCalledWith('¿Qué eventos hay?', expect.any(String));
    resolveReply({ texto: 'Hay un concierto este mes.', items: [] });

    expect(await screen.findByText('Hay un concierto este mes.')).toBeInTheDocument();
    const messages = JSON.parse(localStorage.getItem('caco.ai.messages'));
    expect(messages.slice(-2).map(({ role, texto }) => ({ role, texto }))).toEqual([
      { role: 'user', texto: '¿Qué eventos hay?' },
      { role: 'assistant', texto: 'Hay un concierto este mes.' },
    ]);

    unmount();
    renderAssistant();
    await user.click(screen.getByRole('button', { name: 'Lulu-Bot' }));
    expect(screen.getByText('Hay un concierto este mes.')).toBeInTheDocument();
  });

  it('shows an error in the conversation when the webhook fails', async () => {
    const user = userEvent.setup();
    aiService.chatWorkflow.mockRejectedValueOnce(new Error('Webhook unavailable'));
    renderAssistant();

    await user.click(screen.getByRole('button', { name: 'Lulu-Bot' }));
    await user.type(screen.getByRole('textbox', { name: 'Escribe tu consulta al asistente cultural' }), 'Hola');
    await user.click(screen.getByRole('button', { name: 'Enviar consulta' }));
    expect(await screen.findByText('No pude conectar con el asistente. Intenta de nuevo en un momento.')).toBeInTheDocument();
    expect(await screen.findByText('No pude conectar con el asistente. Intenta de nuevo en un momento.')).toBeInTheDocument();
  });
});
