export type OS = 'darwin' | 'pwa';

export const targetOS: OS = import.meta.env.VITE_TARGET_OS ? import.meta.env.VITE_TARGET_OS as OS : 'pwa';