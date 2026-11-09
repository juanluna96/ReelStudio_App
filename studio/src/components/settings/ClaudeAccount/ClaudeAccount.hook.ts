import {useEffect, useState} from 'react';
import {settingsApi, type ClaudeAccount} from '../../../api';
import type {AccountChoice} from './ClaudeAccount.types';

// The account in use, switching it, and the terminal to log in (or accept new terms) on it.
export function useClaudeAccount(onChanged: () => void) {
  const [account, setAccount] = useState<ClaudeAccount | null>(null);
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    settingsApi.claudeAccount().then(setAccount, (e: Error) => setErr(e.message));
  }, []);
  const act = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr('');
    try {
      await fn();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const choose = (c: AccountChoice) =>
    act(async () => {
      if (!account || (c === 'separate') === account.separate) return;
      setAccount(await settingsApi.setClaudeSeparate(c === 'separate'));
      setOpened(false);
      onChanged();
    });
  const openTerminal = () =>
    act(async () => {
      await settingsApi.openClaudeTerminal();
      setOpened(true);
    });
  return {account, choice: (account?.separate ? 'separate' : 'terminal') as AccountChoice, busy, opened, err, choose, openTerminal, recheck: onChanged};
}
