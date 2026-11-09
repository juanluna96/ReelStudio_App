import {Pencil, Plus} from 'lucide-react';
import {cn} from '@/lib/utils';
import {COLORS, VerticalIcon} from '../../../Ideas';
import * as s from './VerticalChips.styles';
import type {VerticalChipsProps} from './VerticalChips.types';

// The content verticals as filter chips: «Todas», then each one with its colour, icon and how many ideas it has.
// Clicking one filters the board (again: back to all); its pencil edits it. The description shows on hover.
export default function VerticalChips({verticals, counts, total, filter, onFilter, onEdit, onNew}: VerticalChipsProps) {
  return (
    <div role="group" aria-label="Verticales de contenido" className={s.root}>
      <button type="button" aria-pressed={!filter} onClick={() => onFilter(null)} className={s.all({active: !filter})}>
        Todas <span className="tabular-nums opacity-70">{total}</span>
      </button>
      {verticals.map((v) => {
        const active = filter === v.id;
        return (
          <span key={v.id} className={cn(s.chip({state: active ? 'active' : filter ? 'dimmed' : 'idle'}), COLORS[v.color].badge)}>
            <button type="button" aria-pressed={active} title={v.description || undefined} onClick={() => onFilter(active ? null : v.id)} className="inline-flex items-center gap-1.5">
              <VerticalIcon icon={v.icon} className="size-4" />
              {v.name}
              <span className={s.count}>{counts[v.id] ?? 0}</span>
            </button>
            <button type="button" onClick={() => onEdit(v)} aria-label={`Editar la vertical ${v.name}`} title="Editar la vertical" className={s.edit}>
              <Pencil className="size-3" />
            </button>
          </span>
        );
      })}
      <button type="button" onClick={onNew} className={s.add}>
        <Plus className="size-3.5" /> Vertical
      </button>
    </div>
  );
}
