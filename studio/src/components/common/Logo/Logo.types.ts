export type LogoVariant = 'mark' | 'full';

export interface LogoProps {
  /** mark = only the symbol; full = symbol + "Reel Studio". */
  variant?: LogoVariant;
  /** Size of the symbol in px. */
  size?: number;
  /** Plays the loading animation (reel breathing, spark twinkling). */
  animated?: boolean;
  /** With animated: it finished loading, so the feed fades out and the play pops in (FINALE_MS). */
  loaded?: boolean;
  className?: string;
}
