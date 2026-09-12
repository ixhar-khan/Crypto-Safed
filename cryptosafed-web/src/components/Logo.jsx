export default function Logo({ className = "h-10 w-10" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="CryptoSafed"
    >
      <defs>
        <linearGradient
          id="cs-shield-grad"
          x1="8"
          y1="4"
          x2="56"
          y2="60"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#1FBE96" />
          <stop offset="1" stopColor="#0B5C48" />
        </linearGradient>
      </defs>
      <path
        d="M32 4 L54 13 V29 C54 44 44 54 32 60 C20 54 10 44 10 29 V13 Z"
        fill="url(#cs-shield-grad)"
      />
      <rect x="23" y="34" width="4" height="10" rx="1.5" fill="#F3FBF8" />
      <rect x="30" y="27" width="4" height="17" rx="1.5" fill="#F3FBF8" />
      <rect x="37" y="20" width="4" height="24" rx="1.5" fill="#F3FBF8" />
    </svg>
  );
}
