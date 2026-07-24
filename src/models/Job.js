import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    externalRedirectUrl: { type: String, default: null }, // URL de destino final (ex: Gupy, Solides, Lever)
    source: { type: String, required: true }, // e.g. 'LinkedIn', 'Gupy', 'Solides', 'Glassdoor'
    salary: {
      offered: { type: String, default: null },
      estimatedMarketValue: { type: String, default: null },
      salaryExpectationToFill: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        recommendedText: { type: String, default: '' },
        justification: { type: String, default: '' },
      },
    },
    matchScore: { type: Number, min: 0, max: 100, default: 0 },
    verdict: { type: String, enum: ['Candidatar', 'Opcional', 'Descartar'], default: 'Candidatar' },
    isGhostJob: {
      isGhost: { type: Boolean, default: false },
      explanation: { type: String, default: '' },
    },
    rhTrigger: { type: String, default: '' },
    atsPassability: { type: String, default: '' },
    actionReport: {
      customCoverLetter: { type: String, default: '' },
      applicationTips: [{ type: String }],
      fullReportText: { type: String, default: '' },
    },
    feedbackDetails: {
      emailSubject: { type: String, default: null },
      emailReceivedAt: { type: Date, default: null },
      notes: { type: String, default: null },
    },
    status: {
      type: String,
      enum: ['scraped', 'evaluated', 'applied', 'interview', 'rejected', 'archived'],
      default: 'scraped',
    },
    appliedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    interviewAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export const Job = mongoose.model('Job', jobSchema);
