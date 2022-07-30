import React, { useContext, useMemo } from 'react';
import useSavedState from './useSavedState';

export type IPreferences = {
  dataPath: string;
  gamePath: string;
  isDirectData: boolean;
  mergedPath: string;
  rawGamePath: string;
  setIsDirectData: (value: boolean) => void;
  setRawGamePath: (value: string) => void;
};

export const Context = React.createContext<IPreferences | null>(null);

export function usePreferences(): IPreferences {
  const context = useContext(Context);
  if (context == null) {
    throw new Error('No preferences context available.');
  }
  return context;
}

type Props = {
  children: React.ReactNode;
};

export function PreferencesProvider({ children }: Props): JSX.Element {
  const [rawGamePath, setRawGamePath] = useSavedState(
    'paths',
    'C:\\Battle.net\\Games\\Diablo II Resurrected'
  );

  const [isDirectData, setIsDirectData] = useSavedState(
    'direct-data',
    false,
    (bool) => String(bool),
    (str) => str === 'true'
  );

  const gamePath = rawGamePath.replace(/\\$/, '');
  const mergedPath = `${gamePath}\\mods\\D2RMM\\D2RMM.mpq\\data`;
  const dataPath = `${gamePath}\\data`;

  const context = useMemo(
    (): IPreferences => ({
      dataPath,
      gamePath,
      isDirectData,
      mergedPath,
      rawGamePath,
      setIsDirectData,
      setRawGamePath,
    }),
    [
      dataPath,
      gamePath,
      isDirectData,
      mergedPath,
      rawGamePath,
      setIsDirectData,
      setRawGamePath,
    ]
  );

  return <Context.Provider value={context}>{children}</Context.Provider>;
}
