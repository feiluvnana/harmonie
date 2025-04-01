import { Cascade, Entity, ManyToOne, OneToMany, OptionalProps, PrimaryKey, Property, sql } from "@mikro-orm/core";
import { Poll } from "./poll.entity";
import { PollVote } from "./poll_vote.entity";

@Entity()
export class PollOption {
  [OptionalProps]?: "poll" | "votes" | "count" | "createdAt" | "updatedAt";

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

  @Property({ default: sql.now() })
  declare createdAt: Date;

  @Property({ default: sql.now(), onUpdate: () => sql.now() })
  declare updatedAt: Date;
}
