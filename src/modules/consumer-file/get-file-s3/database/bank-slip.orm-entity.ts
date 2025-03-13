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

  @Column({ type: 'uuid', name: 'debty_id' })
  debtyId: string;

  @Column({ name: 'bank_slip_generated' })
  bankSlipGenerated: boolean;

  @Column({ name: 'email_sended' })
  emailSended: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
