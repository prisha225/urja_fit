// Generated from packages/contracts/schemas/*.schema.json. Do not hand edit.
export type Space = "tiny" | "room" | "balcony";
export type Equip = "none" | "bottle" | "chair" | "band" | "mat" | "towel";
export type Lang = "en" | "hinglish" | "hi";
export interface UserProfile { ageBand:"18-29"|"30-44"|"45-59"|"60+"; goal:"energy"|"strength"|"gentle_weight_loss"|"mobility"; level:"new"|"some"|"regular"; pockets:{start:string;minutes:number}[];space:Space;equipment:Equip[];quiet:boolean;lang:Lang;diet:"veg"|"egg"|"nonveg"|"jain";region:"north"|"south"|"east"|"west"|"maharashtrian"|"gujarati"|"bengali"|"other";budgetBand:"low"|"mid"|"flex";cookMinutes:20|40|60;avoidFoods:string[];tracks:("home"|"yoga"|"cycle_wellness")[];}
export interface ScreeningResult { outcome:"GO"|"GO_GENTLE"|"STOP_CONSULT";flags:string[]; }
export interface Block {exerciseId:string;sets:number;reps?:number;holdSec?:number;restSec:number;note?:string;}
export interface Session {pocketStart:string;minutes:number;warmup:Block[];main:Block[];cooldown:Block[];rationale:string;}
export interface DayPlan {date:string;kind:"train"|"gentle"|"rest";sessions:Session[];source?:"llm"|"fallback";}
export interface Meal {id:string;slot:"breakfast"|"lunch"|"dinner"|"snack";items:{foodId:string;grams:number}[];kcal:number;proteinG:number;costInr:number;cookMin:number;tags:string[];familyShareable:boolean;}
export interface MealPlan {date:string;meals:Meal[];targets:{kcal:number;proteinG:number};totals:{kcal:number;proteinG:number;costInr:number};}
export interface PlanResponse {plans:DayPlan[];}
