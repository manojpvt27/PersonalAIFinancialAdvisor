'use client';

export interface SetupChecklist {
  accountAdded: boolean;
  incomeAdded: boolean;
  expensesAdded: boolean;
  goalCreated: boolean;
}

export const DEFAULT_CHECKLIST: SetupChecklist = {
  accountAdded: false,
  incomeAdded: false,
  expensesAdded: false,
  goalCreated: false
};

export function isDemoModeActive(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem('finai:demo-mode');
    if (raw === null) return true; // Default to demo enabled for showcase
    return raw === 'true';
  } catch {
    return true;
  }
}

export function setDemoModeActive(active: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('finai:demo-mode', String(active));
    window.dispatchEvent(new CustomEvent('finai:demo-mode-change', { detail: { isDemo: active } }));
  } catch (e) {
    console.error('Failed to set demo mode:', e);
  }
}

export function getSetupChecklist(): SetupChecklist {
  if (typeof window === 'undefined') return DEFAULT_CHECKLIST;
  try {
    const raw = localStorage.getItem('finai:setup-checklist');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get setup checklist:', e);
  }
  return DEFAULT_CHECKLIST;
}

export function updateSetupChecklist(update: Partial<SetupChecklist>): SetupChecklist {
  if (typeof window === 'undefined') return DEFAULT_CHECKLIST;
  const current = getSetupChecklist();
  const updated = { ...current, ...update };
  try {
    localStorage.setItem('finai:setup-checklist', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('finai:checklist-change', { detail: updated }));
  } catch (e) {
    console.error('Failed to update setup checklist:', e);
  }
  return updated;
}

export function resetAllFinancialData(): void {
  if (typeof window === 'undefined') return;
  try {
    // Clear demo transactions, budgets, goals, and accounts cache
    localStorage.removeItem('finai:accounts');
    localStorage.removeItem('finai:transactions');
    localStorage.removeItem('finai:budgets');
    localStorage.removeItem('finai:goals');
    localStorage.removeItem('finai:subscriptions');
    localStorage.removeItem('finai:bills');
    localStorage.removeItem('finai:vault');
    localStorage.setItem('finai:demo-mode', 'false');
    localStorage.setItem('finai:setup-checklist', JSON.stringify(DEFAULT_CHECKLIST));
    window.dispatchEvent(new CustomEvent('finai:data-reset'));
    window.dispatchEvent(new CustomEvent('finai:demo-mode-change', { detail: { isDemo: false } }));
  } catch (e) {
    console.error('Failed to reset financial data:', e);
  }
}
