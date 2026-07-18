export interface CombatantDetail {
    speed_real: number;
    best_move_name: string;
    best_move_type: string;
    best_move_power: number;
    type_multiplier: number;
    turns_to_kill: number;
  }
  
  export interface OneVsOneRequest {
    my_pokemon_name: string;
    my_evs: Record<string, number>;
    my_nature: string;
    opp_pokemon_name: string;
  }
  
  export interface OneVsOneResponse {
    my_pokemon_name: string;
    opp_pokemon_name: string;
    action_order: "FIRST" | "SECOND";
    my_detail: CombatantDetail;
    opp_detail: CombatantDetail;
    judgment: string;
    reason_category: string | null;
  }