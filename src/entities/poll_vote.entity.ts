import { Entity, ManyToOne, PrimaryKey, Property, sql } from "@mikro-orm/core";
import { PollOption } from "./poll_option.entity";

@Entity()
export class PollVote {
  @PrimaryKey({ type: "uuid", nullable: false })
  declare id: string;

  @Property({ nullable: false })
  declare userId: string;

  @ManyToOne({ entity: () => PollOption, nullable: false, updateRule: "cascade", deleteRule: "cascade" })
  declare option: PollOption;

  @Property({ default: sql.now() })
  declare createdAt: Date;

  @Property({ default: sql.now(), onUpdate: () => sql.now() })
  declare updatedAt: Date;
}
