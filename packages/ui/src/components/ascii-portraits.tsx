"use client"

import { AsciiImage, type AsciiImageProps } from "@workspace/ui/components/ascii-image"

export const PLAYER_IMAGE_PATHS = {
  messi: "/images/players/messi.jpg",
  ronaldo: "/images/players/ronaldo.jpg",
  viratKohli: "/images/players/virat-kohli.jpg",
} as const

export type AsciiPortraitProps = Omit<AsciiImageProps, "src" | "preset" | "resolution"> & {
  src?: string
}

function PortraitBase({
  src,
  alt,
  foreground = "#f1f1f1",
  background = "#151619",
  contrast = 1.1,
  ...rest
}: AsciiPortraitProps & { src: string; alt: string }) {
  return (
    <AsciiImage
      src={src}
      alt={alt}
      preset="detailed"
      resolution="high"
      foreground={foreground}
      background={background}
      contrast={contrast}
      {...rest}
    />
  )
}

export function AsciiMessi({ src = PLAYER_IMAGE_PATHS.messi, alt = "Lionel Messi rendered as ASCII typography", ...rest }: AsciiPortraitProps) {
  return <PortraitBase src={src} alt={alt} {...rest} />
}

export function AsciiRonaldo({ src = PLAYER_IMAGE_PATHS.ronaldo, alt = "Cristiano Ronaldo rendered as ASCII typography", ...rest }: AsciiPortraitProps) {
  return <PortraitBase src={src} alt={alt} {...rest} />
}

export function AsciiViratKohli({ src = PLAYER_IMAGE_PATHS.viratKohli, alt = "Virat Kohli rendered as ASCII typography", ...rest }: AsciiPortraitProps) {
  return <PortraitBase src={src} alt={alt} {...rest} />
}
