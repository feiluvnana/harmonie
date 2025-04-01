import { Cascade, Collection, Entity, OneToMany, OptionalProps, PrimaryKey, Property, sql } from "@mikro-orm/core";
import { PollStatus } from "../core/enums";
import { PollOption } from "./poll_option.entity";

@Entity()
export class Poll {
  [OptionalProps]?:
    | "id"
    | "options"
    | "anonymous"
    | "messageId"
    | "multiple"
    | "endsAt"
    | "status"
    | "createdAt"
    | "updatedAt";

  @PrimaryKey({ nullable: false })
  declare id: number;

  @Property({ nullable: false })
  declare question: string;

  @OneToMany({ entity: () => PollOption, mappedBy: (option) => option.poll, cascade: [Cascade.ALL] })
  declare options: Collection<PollOption>;

  @Property({ nullable: false })
  declare userId: string;

  @Property({ nullable: false })
  declare guildId: string;

  @Property({ nullable: false })
  declare channelId: string;

  @Property({ nullable: true })
  declare messageId?: string;

  @Property({ nullable: false, default: true })
  declare anonymous: boolean;

  @Property({ nullable: false, default: false })
  declare multiple: boolean;

  @Property({
    nullable: false,
    defaultRaw: "(current_timestamp + interval 1 hour)",
  })
  declare endsAt: Date;

  @Property({
    nullable: false,
    columnType: `enum(${Object.values(PollStatus)
      .map((status) => `'${status}'`)
      .join(",")})`,
    default: PollStatus.ACTIVE,
  })
  declare status: PollStatus;

  @Property({ default: sql.now() })
  declare createdAt: Date;

  @Property({ default: sql.now(), onUpdate: () => new Date() })
  declare updatedAt: Date;
}
