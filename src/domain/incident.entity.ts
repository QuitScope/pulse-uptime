import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Monitor } from "./monitor.entity.js";

@Entity()
export class Incident {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Monitor, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "monitor_id" })
  monitor!: Monitor;

  @Column({ type: "timestamptz", name: "started_at" })
  startedAt!: Date;

  @Column({ type: "timestamptz", name: "resolved_at", nullable: true })
  resolvedAt!: Date | null;
}
