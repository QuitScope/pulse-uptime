import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Monitor {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  url!: string;

  @Column({ type: "int", name: "interval_seconds" })
  intervalSeconds!: number;

  @Column({ type: "int", name: "expected_status_code" })
  expectedStatusCode!: number;

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;
}
