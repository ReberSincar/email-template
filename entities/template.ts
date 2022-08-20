import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { TemplateType } from "./template_type";

@Entity()
export class Template {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  html: string;

  @Column()
  subject: string;

  @Column({
    nullable: true,
  })
  text: string;

  @Column({
    default: new Date(),
  })
  created_at: Date;

  @Column()
  templateTypeId: number;

  @ManyToOne(() => TemplateType)
  @JoinColumn({ name: "templateTypeId", referencedColumnName: "id" })
  type: TemplateType;

  constructor(
    name: string,
    html: string,
    subject: string,
    text: string,
    type: TemplateType
  ) {
    this.name = name;
    this.html = html;
    this.subject = subject;
    this.text = text;
    this.type = type;
  }
}
