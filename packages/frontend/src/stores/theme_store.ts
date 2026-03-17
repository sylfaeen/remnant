import { create } from 'zustand';

type ThemeState = {
  theme: 'light';
};

export const useThemeStore = create<ThemeState>()(() => ({
  theme: 'light',
}));
