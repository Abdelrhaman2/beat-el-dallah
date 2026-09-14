"use client";

import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({ className = "", size = "md" }: BrandLogoProps) {
  const dimensions = {
    sm: { width: 140, height: 42 },
    md: { width: 190, height: 57 },
    lg: { width: 240, height: 72 },
  }[size];

  return (
    <Link href="/" className={`inline-flex items-center gap-2 transition-transform hover:opacity-95 ${className}`}>
      <Image
        src="/logo.svg"
        alt="بيت الدلة | Beit El Dallah"
        width={dimensions.width}
        height={dimensions.height}
        priority
        className="h-auto w-auto object-contain"
      />
    </Link>
  );
}
