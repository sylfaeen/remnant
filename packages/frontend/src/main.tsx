import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from '@remnant/frontend/routes';
import '@remnant/frontend/i18n';
import '@remnant/frontend/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
