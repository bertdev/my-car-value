import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Report {
  @PrimaryColumn()
  id: number;

  @Column()
  price: number;
}
