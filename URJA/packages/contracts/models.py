# packages/contracts/models.py
# Pydantic models for contracts frozen at Phase 0 according to Build Spec §4

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

SpaceType = Literal["tiny", "room", "balcony"]
EquipType = Literal["none", "bottle", "chair", "band", "mat", "towel"]
LangType = Literal["en", "hinglish", "hi"]
AgeBandType = Literal["18-29", "30-44", "45-59", "60+"]
GoalType = Literal["energy", "strength", "gentle_weight_loss", "mobility"]
LevelType = Literal["new", "some", "regular"]
DietType = Literal["veg", "egg", "nonveg", "jain"]
RegionType = Literal["north", "south", "east", "west", "maharashtrian", "gujarati", "bengali", "other"]
BudgetBandType = Literal["low", "mid", "flex"]
CookMinutesType = Literal[20, 40, 60]
TrackType = Literal["home", "yoga", "cycle_wellness"]
OutcomeType = Literal["GO", "GO_GENTLE", "STOP_CONSULT"]
PatternType = Literal["squat", "hinge", "push", "core", "mobility", "cardio_low", "balance", "yoga"]
SlotType = Literal["breakfast", "lunch", "dinner", "snack"]

class Pocket(BaseModel):
    start: str
    minutes: int

class UserProfile(BaseModel):
    ageBand: AgeBandType
    goal: GoalType
    level: LevelType
    pockets: List[Pocket]
    space: SpaceType
    equipment: List[EquipType]
    quiet: bool = False
    lang: LangType = "hinglish"
    diet: DietType = "veg"
    region: RegionType = "north"
    budgetBand: BudgetBandType = "mid"
    cookMinutes: CookMinutesType = 20
    avoidFoods: List[str] = Field(default_factory=list)
    tracks: List[TrackType] = Field(default_factory=lambda: ["home"])

class ScreeningResult(BaseModel):
    outcome: OutcomeType
    flags: List[str] = Field(default_factory=list)

class LocalizedName(BaseModel):
    en: str
    hinglish: str
    hi: Optional[str] = None

class LocalizedCues(BaseModel):
    en: List[str]
    hinglish: List[str]

class ReviewInfo(BaseModel):
    by: str
    role: str
    date: str

class CVRule(BaseModel):
    ruleId: str

class Exercise(BaseModel):
    id: str
    name: LocalizedName
    pattern: PatternType
    level: LevelType
    equipment: List[EquipType]
    space: SpaceType
    quiet: bool
    intensityRPE: int = Field(ge=1, le=10)
    contraindicatedFlags: List[str] = Field(default_factory=list)
    gentleOk: bool
    cues: LocalizedCues
    keyframes: str
    cv: Optional[CVRule] = None
    review: Optional[ReviewInfo] = None

class Block(BaseModel):
    exerciseId: str
    sets: int = Field(ge=1)
    reps: Optional[int] = None
    holdSec: Optional[int] = None
    restSec: int = Field(default=30)
    note: Optional[str] = None

class Session(BaseModel):
    pocketStart: str
    minutes: int
    warmup: List[Block]
    main: List[Block]
    cooldown: List[Block]
    rationale: str

class DayPlan(BaseModel):
    date: str
    kind: Literal["train", "gentle", "rest"]
    sessions: List[Session]
    source: Optional[Literal["llm", "fallback"]] = "llm"

class MealItem(BaseModel):
    foodId: str
    grams: float

class Meal(BaseModel):
    id: str
    slot: SlotType
    items: List[MealItem]
    kcal: float
    proteinG: float
    costInr: float
    cookMin: int
    tags: List[str] = Field(default_factory=list)
    familyShareable: bool = False

class MealPlanTargets(BaseModel):
    kcal: float
    proteinG: float

class MealPlanTotals(BaseModel):
    kcal: float
    proteinG: float
    costInr: float

class MealPlan(BaseModel):
    date: str
    meals: List[Meal]
    targets: MealPlanTargets
    totals: MealPlanTotals

class Food(BaseModel):
    id: str
    name: LocalizedName
    category: Literal["grain", "dal", "sabzi", "protein", "salad", "extra"]
    servingGrams: float
    kcalPer100g: float
    proteinGPer100g: float
    carbsGPer100g: float
    fatGPer100g: float
    fibreGPer100g: float
    costInrPer100g: float
    source: str
    diet: List[DietType]
    region: List[str]

class BuddyToolCall(BaseModel):
    tool: Literal["shorten_session", "make_quieter", "swap_exercise", "swap_meal", "explain_exercise", "log_feeling"]
    args: Dict[str, Any]

class BuddyActionResponse(BaseModel):
    reply: str
    action: Optional[Dict[str, Any]] = None
    safetyTriggered: bool = False
