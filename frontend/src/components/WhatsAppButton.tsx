import Link from "next/link";

interface WhatsAppButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function WhatsAppButton({
  href,
  label = "Pedir pelo WhatsApp",
  className = "",
}: WhatsAppButtonProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`whatsapp-button ${className}`.trim()}
      aria-label={label}
    >
      {label}
    </Link>
  );
}
