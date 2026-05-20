-- Legacy drafts use v1 resume mapping (see `normalizeSignalWizardResumeStep`).
ALTER TABLE "Signal" ADD COLUMN "wizardFlowVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Signal" ALTER COLUMN "wizardFlowVersion" SET DEFAULT 2;
