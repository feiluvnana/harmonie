import { Cascade, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Poll } from "./poll.entity";
import { PollVote } from "./poll_vote.entity";

@Entity()
export class PollOption {
  @PrimaryKey({ type: "uuid", nullable: false })
  declare id: string;

  @ManyToOne({ entity: () => Poll, nullable: false, deleteRule: "cascade", updateRule: "cascade" })
  declare poll: Poll;

  @OneToMany({ entity: () => PollVote, mappedBy: (vote) => vote.option, cascade: [Cascade.ALL] })
  declare votes: PollVote[];

  @Property({ nullable: false })
  declare option: string;

  @Property({ nullable: false })
  declare emoji: string;

  @Property({ nullable: false, default: 0 })
  declare count: number;
}
