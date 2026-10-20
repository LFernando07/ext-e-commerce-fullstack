'use client';

import { openConsentPreferences } from '@/lib/consent';

interface Props {
  className?: string;
  label?: string;
}

export default function ConsentPreferencesButton({
  className = "hover:underline cursor-pointer text-xs font-ui text-[#5E5C78] hover:text-[#5B3289] transition-colors",
  label = "Preferencias de cookies",
}: Props) {
  return (
    <button
      type="button"
      onClick={openConsentPreferences}
      className={className}
    >
      {label}
    </button>
  );
}
