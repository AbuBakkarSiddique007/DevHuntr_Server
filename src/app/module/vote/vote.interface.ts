export type VoteType = "UPVOTE" | "DOWNVOTE";

export interface CastVoteBody {
  voteType: VoteType;
}
