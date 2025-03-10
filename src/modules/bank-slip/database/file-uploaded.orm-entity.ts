import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('FileUploaded')
export class FileUploaded {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'file_name' })
  filename: string;

  @Column({ name: 'file_hashed' })
  fileHashed: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
