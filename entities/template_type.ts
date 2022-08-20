import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Template } from "./template";

@Entity()
export class TemplateType {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name: string;

  @OneToMany(() => Template, (template) => template)
  @JoinColumn()
  template: Template[];

  constructor(id?: number, name?: string) {
    this.id = id;
    this.name = name;
  }
}
