import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('FileUploaded')
export class FileUploaded {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'file_name' })
  filename: string;

  @Column({ name: 'file_hashed' })
  fileHashed: string;

  @Column({ name: 'sended_by' })
  sendedBy: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;
}
