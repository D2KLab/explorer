import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function CopyButton({ value, ...props }) {
  const { t } = useTranslation('common');
  const [copied, setCopied] = useState(false);

  return (
    <span
      onMouseLeave={() => {
        if (copied) {
          setTimeout(() => setCopied(false), 500);
        }
      }}
      {...props}
    >
      {copied ? (
        <>{t('common:buttons.copied')}</>
      ) : (
        <a
          href="#"
          onClick={(ev) => {
            ev.preventDefault();
            navigator.clipboard.writeText(value);
            setCopied(true);
          }}
        >
          {t('common:buttons.copy')}
        </a>
      )}
    </span>
  );
}

export default CopyButton;
