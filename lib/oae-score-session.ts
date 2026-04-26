export type OaeScoreSummary = {
  identifyFeelings: number;
  describeFeelings: number;
  externalThinking: number;
  total: number;
};

let lastOaeScore: OaeScoreSummary | null = null;

export function setOaeScore(score: OaeScoreSummary) {
  if (
    Number.isFinite(score.identifyFeelings) &&
    Number.isFinite(score.describeFeelings) &&
    Number.isFinite(score.externalThinking) &&
    Number.isFinite(score.total)
  ) {
    lastOaeScore = score;
  }
}

export function getOaeScore() {
  return lastOaeScore;
}
