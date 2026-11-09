import type {IdeaVertical} from '../../../api';

export interface VerticalChipsProps {
  verticals: IdeaVertical[];
  /** Ideas per vertical id, and on the whole board. */
  counts: Record<string, number>;
  total: number;
  /** The vertical filtering the board (null: all). */
  filter: string | null;
  onFilter: (id: string | null) => void;
  onEdit: (v: IdeaVertical) => void;
  onNew: () => void;
}
