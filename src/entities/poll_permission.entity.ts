import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property, sql } from "@mikro-orm/core";
import { Poll } from "discord.js";

@Entity()
export class PollPermission {
  [OptionalProps]?: "id" | "poll" | "createdAt" | "updatedAt";

  @PrimaryKey({ nullable: false })
  declare id: number;

  @ManyToOne({ entity: () => Poll, nullable: false, updateRule: "cascade", deleteRule: "cascade" })
  declare poll: Poll;

  @Property({ nullable: false })
  declare roleId: string;

  @Property({ nullable: false })
  declare allowViewVotes: boolean;

  @Property({ nullable: false })
  declare allowVote: boolean;

  @Property({ default: sql.now() })
  declare createdAt: Date;

  @Property({ default: sql.now(), onUpdate: () => new Date() })
  declare updatedAt: Date;
}
