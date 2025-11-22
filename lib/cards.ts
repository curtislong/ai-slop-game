// Mad Lib card deck for AI Slop: The Game!

import { MadLibCard } from '@/types/game';

export const cardDeck: MadLibCard[] = [
  {
    id: 'card-1',
    template: 'A ___ creature wearing a ___ made of ___, standing triumphantly on a ___ while holding a glowing ___.',
    blanks: 5,
  },
  {
    id: 'card-2',
    template: 'A hyper-dramatic portrait of a ___ riding a gigantic ___ through a storm of floating ___.',
    blanks: 3,
  },
  {
    id: 'card-3',
    template: 'A bewildered ___ trying to negotiate with a towering ___ constructed entirely from ___.',
    blanks: 3,
  },
  {
    id: 'card-4',
    template: 'An elegant ___ dancing with a ___ in a ballroom filled with ___.',
    blanks: 3,
  },
  {
    id: 'card-5',
    template: 'A tiny ___ piloting a massive ___ through a sea of ___.',
    blanks: 3,
  },
  {
    id: 'card-6',
    template: 'A ___ wizard summoning a ___ made entirely of ___ while standing in a ___.',
    blanks: 4,
  },
  {
    id: 'card-7',
    template: 'An anxious ___ presenting a trophy to a confused ___ in front of an audience of ___.',
    blanks: 3,
  },
  {
    id: 'card-8',
    template: 'A majestic ___ wearing a cape made of ___ while surfing on a wave of ___.',
    blanks: 3,
  },
  {
    id: 'card-9',
    template: 'A ___ chef cooking a ___ using a kitchen utensil shaped like a ___.',
    blanks: 3,
  },
  {
    id: 'card-10',
    template: 'A determined ___ climbing a mountain of ___ to reach a shrine dedicated to ___.',
    blanks: 3,
  },
  {
    id: 'card-11',
    template: 'A cosmic ___ playing a musical instrument made from ___ surrounded by orbiting ___.',
    blanks: 3,
  },
  {
    id: 'card-12',
    template: 'A sophisticated ___ giving a lecture about ___ to a classroom full of ___.',
    blanks: 3,
  },
  {
    id: 'card-13',
    template: 'A mystical ___ emerging from a portal made of ___ carrying an ancient ___.',
    blanks: 3,
  },
  {
    id: 'card-14',
    template: 'A fashionable ___ modeling an outfit made entirely of ___ on a runway surrounded by ___.',
    blanks: 3,
  },
  {
    id: 'card-15',
    template: 'A heroic ___ defending a castle of ___ from an invasion of ___.',
    blanks: 3,
  },
];

export function getRandomCard(): MadLibCard {
  return cardDeck[Math.floor(Math.random() * cardDeck.length)];
}

export function parseTemplate(template: string, words: string[]): string {
  let result = template;
  words.forEach((word) => {
    result = result.replace('___', word);
  });
  return result;
}
