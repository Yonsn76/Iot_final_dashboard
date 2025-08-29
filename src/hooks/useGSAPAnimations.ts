import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const useGSAPAnimations = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Animación de entrada para elementos
  const animateIn = (element: HTMLElement, delay: number = 0) => {
    gsap.fromTo(element, 
      {
        opacity: 0,
        y: 50,
        scale: 0.9,
        rotation: -5
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.8,
        delay,
        ease: "back.out(1.7)"
      }
    );
  };

  // Animación de hover para tarjetas
  const animateHover = (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1.05,
      rotation: 2,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  // Animación de salida del hover
  const animateHoverOut = (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1,
      rotation: 0,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  // Animación de entrada escalonada para múltiples elementos
  const animateStaggered = (elements: HTMLElement[], stagger: number = 0.1) => {
    gsap.fromTo(elements,
      {
        opacity: 0,
        y: 30,
        scale: 0.8
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger,
        ease: "back.out(1.7)"
      }
    );
  };

  // Animación de pulso para iconos
  const animatePulse = (element: HTMLElement) => {
    gsap.to(element, {
      scale: 1.2,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut"
    });
  };

  // Animación de flotación para elementos
  const animateFloat = (element: HTMLElement) => {
    gsap.to(element, {
      y: -10,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut"
    });
  };

  // Animación de entrada para el header
  const animateHeader = (header: HTMLElement, icon: HTMLElement, title: HTMLElement, subtitle: HTMLElement) => {
    const tl = gsap.timeline();
    
    tl.fromTo(icon, 
      { scale: 0, rotation: -180, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 1, ease: "back.out(1.7)" }
    )
    .fromTo(title,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    )
    .fromTo(subtitle,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.3"
    );
  };

  // Animación de entrada para las tarjetas de estadísticas
  const animateStatsCards = (cards: HTMLElement[]) => {
    gsap.fromTo(cards,
      {
        opacity: 0,
        y: 100,
        scale: 0.5,
        rotation: -15
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 1,
        stagger: 0.15,
        ease: "back.out(1.7)"
      }
    );
  };

  // Animación de entrada para los gráficos
  const animateCharts = (charts: HTMLElement[]) => {
    gsap.fromTo(charts,
      {
        opacity: 0,
        x: -100,
        scale: 0.8
      },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
      }
    );
  };

  // Animación de entrada para la tabla
  const animateTable = (table: HTMLElement) => {
    gsap.fromTo(table,
      {
        opacity: 0,
        y: 50,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power2.out"
      }
    );
  };

  // Animación de entrada para el sidebar
  const animateSidebar = (sidebar: HTMLElement) => {
    gsap.fromTo(sidebar,
      {
        x: -100,
        opacity: 0,
        scale: 0.9
      },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)"
      }
    );
  };

  // Animación de entrada para el formulario de login
  const animateLoginForm = (form: HTMLElement) => {
    gsap.fromTo(form,
      {
        opacity: 0,
        scale: 0.8,
        rotation: -10
      },
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1,
        ease: "back.out(1.7)"
      }
    );
  };

  return {
    containerRef,
    animateIn,
    animateHover,
    animateHoverOut,
    animateStaggered,
    animatePulse,
    animateFloat,
    animateHeader,
    animateStatsCards,
    animateCharts,
    animateTable,
    animateSidebar,
    animateLoginForm
  };
};
