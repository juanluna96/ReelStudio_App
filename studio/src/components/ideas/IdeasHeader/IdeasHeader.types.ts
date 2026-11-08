export interface IdeasHeaderProps {
  /** Ideas on the board, and how many lists hold them. */
  total: number;
  lists: number;
  /** The search, and how many ideas match it (with the vertical filter, if any). */
  query: string;
  onQuery: (q: string) => void;
  shown: number;
  filtering: boolean;
  /** Adds an idea to the first list and opens it. */
  onNewIdea: () => void;
}
