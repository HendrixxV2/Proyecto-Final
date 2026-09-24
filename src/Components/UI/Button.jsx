import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/Utils/cn';

const VARIANTS = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 focus-visible:outline-brand-500',
  secondary: 'bg-jade-500 text-white hover:bg-jade-600 focus-visible:outline-jade-500',
  outline:
    'border border-ink-300 bg-transparent text-ink-800 hover:bg-ink-100 dark:border-ink-600 dark:text-ink-100 dark:hover:bg-ink-800',
  ghost: 'bg-transparent text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  gold: 'bg-gold-500 text-ink-900 hover:bg-gold-600 focus-visible:outline-gold-500',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10 p-0',
};

const Button = forwardRef(function Button(
  { as, to, href, variant = 'primary', size = 'md', loading = false, disabled = false, className, children, ...props },
  ref,
) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-xl font-medium transition-colors',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = (
    <>
      {loading && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} aria-disabled={disabled || loading} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }

  const Component = as ?? 'button';

  return (
    <Component
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </Component>
  );
});

export default Button;