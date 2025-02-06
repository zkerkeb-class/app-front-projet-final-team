import React, { ReactNode } from 'react';
import { Detector } from 'react-detect-offline';
import OfflinePage from '../OfflinePage';

interface OfflineWrapperProps {
  children: ReactNode;
}

export default function OfflineWrapper({ children }: OfflineWrapperProps) {
  return (
    <Detector
      render={({ online }: { online: boolean }): React.ReactElement => {
        if (online) {
          return <>{children}</>;
        }
        return <OfflinePage />;
      }}
    />
  );
}
