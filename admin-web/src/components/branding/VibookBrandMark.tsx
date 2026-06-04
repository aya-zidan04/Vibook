import './VibookBrandMark.css';

type Props = {
  /** Pixel width and height (square); full wordmark is scaled to fit. */
  size?: number;
  className?: string;
  /** Accessible name; use empty string for decorative (empty alt). */
  label?: string;
};

const LOGO_LIGHT = '/vibook-logo-mark.png';
const LOGO_DARK = '/vibook-logo-mark-dark.png';

/**
 * Official Vibook vi mark — light vs dark asset follows app/OS theme.
 */
export function VibookBrandMark({ size = 40, className, label = 'Vibook' }: Props) {
  const alt = label === '' ? '' : label;
  const wrapClass = ['vb-brand-mark', className].filter(Boolean).join(' ');
  const imgStyle = {
    width: size,
    height: size,
    objectFit: 'contain' as const,
    display: 'block',
  };

  return (
    <span className={wrapClass} style={{ width: size, height: size }}>
      <img
        className="vb-brand-mark__img vb-brand-mark__img--light"
        src={LOGO_LIGHT}
        alt={alt}
        width={size}
        height={size}
        decoding="async"
        draggable={false}
        style={imgStyle}
      />
      <img
        className="vb-brand-mark__img vb-brand-mark__img--dark"
        src={LOGO_DARK}
        alt={alt}
        width={size}
        height={size}
        decoding="async"
        draggable={false}
        style={imgStyle}
      />
    </span>
  );
}
