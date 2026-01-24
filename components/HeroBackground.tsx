"use client"
import React, { useCallback } from 'react' // Importamos useCallback
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react' // Importamos las flechas

const SLIDES = [
  "/img/mate-destacada.webp", 
  "/img/tradicion-del-mate.webp"
]

export default function HeroBackground() {
  // Capturamos 'emblaApi' para poder controlarlo
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 60 }, [Autoplay({ delay: 5000, stopOnInteraction: false })])

  // Funciones para mover el carrusel manualmente
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <div className="overflow-hidden w-full h-full" ref={emblaRef}>
        <div className="flex w-full h-full">
          {SLIDES.map((src, index) => (
            <div className="flex-[0_0_100%] min-w-0 relative w-full h-full" key={index}>
              <Image 
                src={src} 
                alt="Lifestyle MANTO"
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
              {/* Overlay oscuro (aumenté un poco la oscuridad a 0.5 para más contraste) */}
              <div className="absolute inset-0 bg-black/50 mix-blend-multiply" /> 
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-manto-bg via-manto-bg/50 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* --- BOTONES DE NAVEGACIÓN --- */}
      {/* Botón Izquierdo */}
      <button 
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white hover:bg-black/20 p-2 rounded-full transition-all"
        aria-label="Anterior"
      >
        <ChevronLeft size={48} />
      </button>

      {/* Botón Derecho */}
      <button 
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white hover:bg-black/20 p-2 rounded-full transition-all"
        aria-label="Siguiente"
      >
        <ChevronRight size={48} />
      </button>

    </div>
  )
}