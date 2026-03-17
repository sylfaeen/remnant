import type { PropsWithChildren } from 'react';

export function PageContent({ children }: PropsWithChildren) {
  return (
    <div className={'content'}>
      <div className={'content-container'}>{children}</div>
    </div>
  );
}
