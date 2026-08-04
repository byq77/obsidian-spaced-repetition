import { ReviewResponse } from "src/scheduling/algorithms/base/repetition-item";

export interface IGamificationScorer {
    score(response: ReviewResponse): Promise<void>;
}
