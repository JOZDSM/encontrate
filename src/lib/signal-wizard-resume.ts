/** Last step index in the current Señal wizard (0-based). */
export const SIGNAL_WIZARD_LAST_STEP_INDEX = 9;

/**
 * Map DB `wizardStep` to a safe UI step index when opening the wizard.
 * `wizardFlowVersion` 1 = legacy 8-step flow (single "preferences" screen).
 */
export function normalizeSignalWizardResumeStep(
  wizardStep: number,
  wizardFlowVersion: number,
): number {
  const maxIdx = SIGNAL_WIZARD_LAST_STEP_INDEX;
  const clamped = Math.min(Math.max(0, wizardStep), maxIdx);
  if (wizardFlowVersion >= 2) return clamped;
  if (wizardStep >= 9) return maxIdx;
  if (wizardStep === 8) return 9;
  if (wizardStep === 7) return 8;
  return Math.min(Math.max(0, wizardStep), maxIdx);
}
