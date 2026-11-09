export interface ClaudeAccountProps {
  /** The account changed, or he came back from the terminal: check Claude Code's session again. */
  onChanged: () => void;
}
export type AccountChoice = 'terminal' | 'separate';
