import { act, render, screen } from '@testing-library/react';
import AppIntro from '@/Components/Common/AppIntro';

describe('AppIntro', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows only the welcome greeting and fades out before removing the intro', () => {
    const { container } = render(<AppIntro />);

    act(() => jest.advanceTimersByTime(850));
    expect(screen.getByRole('heading', { name: 'Bienvenid@s' })).toBeInTheDocument();
    expect(screen.queryByText('Centro Cultural Orotinense')).not.toBeInTheDocument();
    expect(screen.queryByText('Un lugar para encontrarnos, crear y celebrar nuestra cultura.')).not.toBeInTheDocument();

    act(() => jest.advanceTimersByTime(1500));
    expect(container.querySelector('.app-intro')).toHaveClass('app-intro--leaving');

    act(() => jest.advanceTimersByTime(700));
    expect(container.querySelector('.app-intro')).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem('caco.intro-seen')).toBe('true');
  });
});
