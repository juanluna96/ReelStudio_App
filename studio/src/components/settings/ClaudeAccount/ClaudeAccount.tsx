import {RefreshCw, SquareTerminal} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {CHOICES} from './ClaudeAccount.constants';
import {useClaudeAccount} from './ClaudeAccount.hook';
import * as s from './ClaudeAccount.styles';
import type {ClaudeAccountProps} from './ClaudeAccount.types';

// Which Claude account the studio uses: the terminal's, or one of its own (so the other stays for coding). The
// terminal button opens claude on that account, to log in or to accept new terms when Claude asks for them.
export default function ClaudeAccount({onChanged}: ClaudeAccountProps) {
  const a = useClaudeAccount(onChanged);
  return (
    <div className={s.root}>
      <p className={s.title}>Cuenta de Claude del estudio</p>
      <div role="radiogroup" aria-label="Cuenta de Claude del estudio" className={s.options}>
        {CHOICES.map((c) => (
          <button key={c.id} type="button" role="radio" aria-checked={a.choice === c.id} disabled={a.busy || !a.account} onClick={() => a.choose(c.id)} className={s.option({on: a.choice === c.id})}>
            <span className={s.optionTitle}>{c.title}</span>
            <span className={s.optionText}>{c.text}</span>
          </button>
        ))}
      </div>
      {a.account && <p className={s.dir}>Carpeta de la cuenta: {a.account.dir}</p>}
      <div className={s.actions}>
        <Button variant="outline" size="sm" disabled={a.busy} onClick={a.openTerminal}>
          <SquareTerminal /> Abrir Claude en Terminal
        </Button>
        {a.opened && (
          <Button variant="ghost" size="sm" onClick={a.recheck}>
            <RefreshCw /> Ya terminé, comprobar
          </Button>
        )}
      </div>
      <p className={s.hint}>
        {a.opened
          ? 'En la Terminal: inicia sesión con /login si te lo pide, o acepta los términos nuevos. Luego vuelve aquí y pulsa «Ya terminé, comprobar».'
          : 'Úsalo para iniciar sesión en esta cuenta o para aceptar los términos cuando Claude los actualice.'}
      </p>
      {a.err && <p className="text-sm text-destructive">{a.err}</p>}
    </div>
  );
}
