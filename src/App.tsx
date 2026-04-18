/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GlobalStateProvider } from "./context/GlobalStateContext";
import { Header } from "./components/layout/Header";
import { Dashboard } from "./components/dashboard/Dashboard";

export default function App() {
  return (
    <GlobalStateProvider>
      <div className="min-h-screen bg-bg-deep text-text-primary flex flex-col font-sans transition-colors">
        <Header />
        <main className="flex-1 flex flex-col">
          <Dashboard />
        </main>
      </div>
    </GlobalStateProvider>
  );
}
