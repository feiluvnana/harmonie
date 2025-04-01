import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property, sql } from "@mikro-orm/core";
import { PollOption } from "./poll_option.entity";

@Entity()
export class PollVote {
  [OptionalProps]?: "id" | "option" | "createdAt" | "updatedAt";

  @PrimaryKey({ nullable: false })
  declare id: number;

  @Property({ nullable: false })
  declare userId: string;

  @ManyToOne({ entity: () => PollOption, nullable: false, updateRule: "cascade", deleteRule: "cascade" })
  declare option: PollOption;

  @Property({ default: sql.now() })
  declare createdAt: Date;

  @Property({ default: sql.now(), onUpdate: () => new Date() })
  declare updatedAt: Date;
}
