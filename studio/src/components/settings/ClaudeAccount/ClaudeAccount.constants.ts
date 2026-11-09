import type {AccountChoice} from './ClaudeAccount.types';

export const CHOICES: {id: AccountChoice; title: string; text: string}[] = [
  {id: 'terminal', title: 'La misma de la terminal', text: 'La cuenta con la que usas claude en tu terminal (~/.claude).'},
  {id: 'separate', title: 'Una cuenta aparte', text: 'Otra cuenta solo para el estudio; la de la terminal queda para programar.'},
];
