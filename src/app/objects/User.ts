import { SelectedAgent } from './SelectedAgent';

export class User {
  companyCode: number;
  role: number;
  execAgent: boolean;
  agentCode: number;
  userName: string;
  firstName: string;
  lastName: string;
  fullName: string;
  address: string;
  expiryDay: number;
  commercialStructure: number;
  selectedAgent: SelectedAgent;

  token: string;
  constructor(init ? : Partial < User > ) {
    Object.assign(this, init);
  }
}
