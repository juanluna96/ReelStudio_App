import {Plus, Search, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {useIdeasHeader} from './IdeasHeader.hook';
import * as s from './IdeasHeader.styles';
import type {IdeasHeaderProps} from './IdeasHeader.types';

// The top of Ideas de contenido: its name, how many ideas there are (or match), the search and «Nueva idea».
export default function IdeasHeader({total, lists, query, onQuery, shown, filtering, onNewIdea}: IdeasHeaderProps) {
  const {input, onKeyDown} = useIdeasHeader(onQuery);
  return (
    <header className={s.root}>
      <div>
        <h1 className={s.title}>Ideas de contenido</h1>
        <p className={s.summary} aria-live="polite">
          {filtering ? `${shown} de ${total} ${total === 1 ? 'idea' : 'ideas'}` : `${total} ${total === 1 ? 'idea' : 'ideas'} en ${lists} ${lists === 1 ? 'lista' : 'listas'}`}
        </p>
      </div>
      <div className={s.actions}>
        <div className={s.search}>
          <Search className={s.searchIcon} aria-hidden />
          <Input ref={input} type="search" value={query} onChange={(e) => onQuery(e.target.value)} onKeyDown={onKeyDown} placeholder="Buscar ideas" aria-label="Buscar ideas" className={s.input} />
          {query ? (
            <button type="button" onClick={() => onQuery('')} aria-label="Borrar la búsqueda" className={s.clear}>
              <X className="size-3.5" />
            </button>
          ) : (
            <kbd className={s.kbd}>/</kbd>
          )}
        </div>
        <Button onClick={onNewIdea}>
          <Plus /> Nueva idea
        </Button>
      </div>
    </header>
  );
}
