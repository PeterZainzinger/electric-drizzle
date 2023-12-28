import { ElectricClient } from 'electric-sql/client/model';
import { schema } from './tables';

export type Electric = ElectricClient<typeof schema>;
