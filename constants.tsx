
import React from 'react';
import { Tour } from './types';

export const TOURS: Tour[] = [
  {
    id: 'lagoa',
    name: 'Passeio Lagoa da Conceição',
    duration: '1 hora',
    price: 35.00,
    description: 'Um tour panorâmico pelas águas calmas da Lagoa, conhecendo a história e as belas paisagens das Rendeiras.',
    itinerary: [
      'Saída: Próximo ao Bar do Boni',
      'Navegação pela orla da Avenida das Rendeiras',
      'Vista panorâmica das dunas da Joaquina',
      'Parada para fotos em pontos históricos',
      'Retorno ao ponto de partida'
    ],
    image: 'https://picsum.photos/seed/lagoa/800/600'
  },
  {
    id: 'sunset',
    name: 'Passeio Pôr do Sol',
    duration: '1 hora',
    price: 35.00,
    description: 'A experiência mais romântica da Ilha. Assista ao sol se pondo atrás das montanhas da Lagoa.',
    itinerary: [
      'Saída 17h (ajustável conforme estação)',
      'Navegação central na Lagoa',
      'Momento contemplativo do Pôr do Sol',
      'Retorno com luzes da cidade começando a brilhar'
    ],
    image: 'https://picsum.photos/seed/sunset/800/600'
  },
  {
    id: 'pools',
    name: 'Piscinas Naturais e Canal da Barra',
    duration: '3-4 horas',
    price: 70.00,
    description: 'Nosso tour mais completo. Explore o Canal da Barra da Lagoa e mergulhe nas águas cristalinas das piscinas naturais.',
    itinerary: [
      'Navegação pelo Canal da Barra da Lagoa',
      'Visita à vila de pescadores',
      'Parada para banho nas Piscinas Naturais',
      'Exploração do encontro da Lagoa com o Mar',
      'Retorno panorâmico'
    ],
    image: 'https://picsum.photos/seed/pools/800/600'
  }
];

export const Icons = {
  Boat: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17c.6.5 1.2 1 2.5 1 2.3 0 2.3-2 4.5-2 2.3 0 2.3 2 4.5 2s2.2-2 4.5-2c1.3 0 1.9.5 2.5 1"/><path d="m3 11 8-5 8 5M5 11v6h14v-6"/><path d="M9 11v3"/><path d="M15 11v3"/></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  MapPin: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  ),
  Instagram: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
  ),
  Camera: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
  ),
  Magic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>
  )
};
