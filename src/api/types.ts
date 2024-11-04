export interface Schedule {
  id: string;
  // Add other types
}
export interface Schedule {
  id?: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  buffer_time?: number;
  risk_score?: number;
  total_duration?: number;
  blocks?: Block[];
  event_id?: number;
}

export interface Block {
  id?: number;
  schedule_id?: number;
  name: string;
  duration: number;
  location?: string;
  type?: string;
  complexity?: number;
  max_participants?: number;
  required_staff?: number;
  tech_break_duration?: number;
  start_time?: string;
  order?: number;
  equipment?: Equipment[];
  items?: BlockItem[];
  risk_factors?: RiskFactor[];
  dependencies?: number[];
}

export interface Equipment {
  id?: number;
  name: string;
  type?: string;
  setup_time?: number;
  complexity_score?: number;
}

export interface BlockItem {
  id?: number;
  block_id?: number;
  name: string;
  description?: string;
  duration?: number;
  type?: string;
  requirements?: string;
  order?: number;
  equipment?: Equipment[];
  participants?: Participant[];
}


export interface RiskFactor {
  id?: number;
  block_id?: number;
  type: string;
  probability: number;
  impact: number;
  mitigation?: string;
}

export interface Participant {
  id?: number;
  block_item_id?: number;
  name: string;
  role?: string;
  requirements?: string;
}
