import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Monitor } from "./monitor.entity.js";

@Entity()
export class Check {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Monitor, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "monitor_id" })
  monitor!: Monitor;

  @Column({ type: "int", name: "http_status", nullable: true })
  httpStatus!: number | null;

  @Column({ type: "int", name: "response_time_ms" })
  responseTimeMs!: number;

  @Column({ type: "boolean" })
  success!: boolean;

  @Column({ type: "varchar", name: "error_message", nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn({ type: "timestamptz", name: "checked_at" })
  checkedAt!: Date;
}
