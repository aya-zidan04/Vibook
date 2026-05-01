type Props = {
  /** Pixel width and height (square); full wordmark is scaled to fit. */
  size?: number;
  className?: string;
  /** Accessible name; use empty string for decorative (empty alt). */
  label?: string;
};

const WORDMARK_SRC = '/vibook-wordmark.jpg';

/**
 * Official VIBOOK wordmark on gradient (asset in `/public/vibook-wordmark.jpg`).
 */
export function VibookBrandMark({ size = 40, className, label = 'Vibook' }: Props) {
  return (
    <img
      className={className}
      src={WORDMARK_SRC}
      alt={label === '' ? '' : label}
      width={size}
      height={size}
      decoding="async"
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}
