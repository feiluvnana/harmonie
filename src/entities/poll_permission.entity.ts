import { Entity, ManyToOne, PrimaryKey, Property, sql } from "@mikro-orm/core";
import { Poll } from "discord.js";

@Entity()
export class PollPermission {
  @PrimaryKey({ type: "uuid", nullable: false })
  declare id: string;

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

  @Property({ default: sql.now(), onUpdate: () => sql.now() })
  declare updatedAt: Date;
}
