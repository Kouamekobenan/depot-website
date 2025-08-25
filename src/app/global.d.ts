// global.d.ts
export {};

declare global {
  interface Window {
    electronAPI?: {
      getToken: () => Promise<string | undefined>;
      setToken: (token: string) => Promise<void>;
      deleteToken: () => Promise<void>; // ← ajoute cette ligne
      notifyLoginSuccess: (title: string, body: string) => void;
    };
  }
}
