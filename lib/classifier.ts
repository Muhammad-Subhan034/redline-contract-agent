import weights from "./model/weights.json";
import type { ClauseType } from "./playbook";

/**
 * Pure-TS reimplementation of sklearn's TfidfVectorizer(unigrams, English stopwords
 * removed) + LogisticRegression, trained in ml/train_classifier.py.
 */

type Weights = {
  vocabulary: string[];
  idf: number[];
  classes: string[];
  weights: number[][];
  bias: number[];
  trainedOn: number;
};

const W = weights as Weights;
const VOCAB_INDEX = new Map(W.vocabulary.map((term, i) => [term, i]));

function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9_]+/g) ?? [];
  return matches.filter((t) => t.length >= 2);
}

function tfidfVector(text: string): number[] {
  const vec = new Array(W.vocabulary.length).fill(0);
  for (const token of tokenize(text)) {
    const idx = VOCAB_INDEX.get(token);
    if (idx !== undefined) vec[idx] += 1;
  }
  for (let i = 0; i < vec.length; i++) vec[i] *= W.idf[i];
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (norm > 0) for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  return vec;
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export type ClauseTypeResult = {
  type: ClauseType;
  probabilities: Record<string, number>;
  confidence: number;
};

export function classifyClauseType(text: string): ClauseTypeResult {
  const vec = tfidfVector(text);
  const logits = W.classes.map((_, classIdx) => {
    const row = W.weights[classIdx];
    const dot = row.reduce((sum, w, i) => sum + w * vec[i], 0);
    return dot + W.bias[classIdx];
  });
  const probs = softmax(logits);
  const probabilities: Record<string, number> = {};
  W.classes.forEach((c, i) => (probabilities[c] = probs[i]));

  const topIdx = probs.indexOf(Math.max(...probs));
  return {
    type: W.classes[topIdx] as ClauseType,
    probabilities,
    confidence: probs[topIdx],
  };
}

export const modelMeta = {
  vocabularySize: W.vocabulary.length,
  classes: W.classes,
  trainedOn: W.trainedOn,
};
