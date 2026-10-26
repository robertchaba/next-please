/** Game milliseconds per real millisecond: 30 seconds = 30 or 5 game minutes. */
export const CLINIC_CLOCK_RATES = { patient: 60, empty: 10 } as const;

/** Receives monotonic timestamps from the controller, never reads a clock itself. */
export class ClinicClock {
  private previous: number;
  private rate = 0;
  private remainder = 0;

  constructor(now: number) { this.previous = now; }

  /** Account for the preceding context before switching to the next one. */
  sample(now: number, running: boolean, patientPresent: boolean): number {
    const elapsed = Math.max(0, now - this.previous);
    this.previous = now;
    const total = this.remainder + elapsed * this.rate;
    const minutes = Math.floor(total / 60_000);
    this.remainder = total - minutes * 60_000;
    this.setContext(running, patientPresent);
    return minutes;
  }

  setContext(running: boolean, patientPresent: boolean): void {
    this.rate = running ? patientPresent ? CLINIC_CLOCK_RATES.patient : CLINIC_CLOCK_RATES.empty : 0;
  }

  /** New games, days and successful imports start at the saved whole minute. */
  reset(now: number): void {
    this.previous = now;
    this.rate = 0;
    this.remainder = 0;
  }
}
