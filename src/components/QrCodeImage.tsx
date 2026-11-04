import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeImageProps {
  value?: string;
  url?: string;
  size?: number;
  className?: string;
}

export const QrCodeImage: React.FC<QrCodeImageProps> = ({
  value,
  url,
  size = 72,
  className = '',
}) => {
  const [svgDataUrl, setSvgDataUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  // Support both value and url props, ensure it's a non-empty string
  const textToEncode = (value || url || '').trim();

  useEffect(() => {
    let isMounted = true;

    if (!textToEncode) {
      setSvgDataUrl('');
      setError(false);
      return;
    }

    try {
      // Use SVG string generation: 100% canvas-free, eliminates any getContext errors
      QRCode.toString(textToEncode, {
        type: 'svg',
        margin: 1,
        errorCorrectionLevel: 'M',
      })
        .then((svgString) => {
          if (isMounted) {
            const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
            setSvgDataUrl(dataUri);
            setError(false);
          }
        })
        .catch((err) => {
          console.warn('QR code generation error:', err);
          if (isMounted) setError(true);
        });
    } catch (err) {
      console.warn('QR code sync error:', err);
      if (isMounted) setError(true);
    }

    return () => {
      isMounted = false;
    };
  }, [textToEncode]);

  if (error || !svgDataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 rounded border ${className}`}
      >
        QR
      </div>
    );
  }

  return (
    <img
      src={svgDataUrl}
      alt="QR Code"
      width={size}
      height={size}
      className={`inline-block ${className}`}
      loading="lazy"
    />
  );
};
