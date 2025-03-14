import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('BankSlip')
export class BankSlip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', name: 'debt_id', unique: true })
  debtId: string;

  @Column()
  name: string;

  @Column({ name: 'government_id' })
  governmentId: number;

  @Column()
  email: string;

  @Column({ name: 'debt_amount' })
  debtAmount: number;

  @Column({ name: 'debt_due_date' })
  debtDueDate: Date;

  @Column({ name: 'bank_slip_generated' })
  bankSlipGenerated: boolean;

  @Column({ name: 'email_sended' })
  emailSended: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
