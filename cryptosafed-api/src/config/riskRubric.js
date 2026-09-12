export const riskRubric = {
  anon_team: { weight: 20, description: "Anonymous or unverifiable team" },
  no_audit: {
    weight: 15,
    description: "No audit information or unknown auditor",
  },
  high_apy: { weight: 25, description: "Unrealistic APY / guaranteed returns" },
  guarantee_language: {
    weight: 15,
    description: 'Explicit "no risk" or "guaranteed" claims',
  },
  negative_search: {
    weight: 15,
    description: "Negative search findings (scam, fraud, rug)",
  },
  opaque_tokenomics: {
    weight: 10,
    description: "Unclear or highly centralized token distribution",
  },
};

export const riskLevels = {
  low: { min: 0, max: 25, label: "Low" },
  medium: { min: 26, max: 50, label: "Medium" },
  high: { min: 51, max: 75, label: "High" },
  critical: { min: 76, max: 100, label: "Critical" },
};
