# Generated from packages/contracts/schemas/*.schema.json. Do not hand edit.
from datetime import date
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

class Pocket(StrictModel): start: str; minutes: int = Field(gt=0)
class UserProfile(StrictModel):
    ageBand: Literal["18-29", "30-44", "45-59", "60+"]
    goal: Literal["energy", "strength", "gentle_weight_loss", "mobility"]
    level: Literal["new", "some", "regular"]
    pockets: list[Pocket]; space: Literal["tiny", "room", "balcony"]
    equipment: list[Literal["none", "bottle", "chair", "band", "mat", "towel"]]
    quiet: bool; lang: Literal["en", "hinglish", "hi"]
    diet: Literal["veg", "egg", "nonveg", "jain"]
    region: Literal["north", "south", "east", "west", "maharashtrian", "gujarati", "bengali", "other"]
    budgetBand: Literal["low", "mid", "flex"]; cookMinutes: Literal[20, 40, 60]
    avoidFoods: list[str]; tracks: list[Literal["home", "yoga", "cycle_wellness"]]
class ScreeningResult(StrictModel): outcome: Literal["GO", "GO_GENTLE", "STOP_CONSULT"]; flags: list[str]
class Block(StrictModel): exerciseId: str; sets: int = Field(gt=0); reps: int | None = Field(default=None, gt=0); holdSec: int | None = Field(default=None, gt=0); restSec: int = Field(ge=0); note: str | None = None
class Session(StrictModel): pocketStart: str; minutes: int = Field(gt=0); warmup: list[Block]; main: list[Block]; cooldown: list[Block]; rationale: str
class DayPlan(StrictModel): date: date; kind: Literal["train", "gentle", "rest"]; sessions: list[Session]; source: Literal["llm", "fallback"] | None = None
class FoodItem(StrictModel): foodId: str; grams: float = Field(gt=0)
class Meal(StrictModel): id: str; slot: Literal["breakfast", "lunch", "dinner", "snack"]; items: list[FoodItem]; kcal: float = Field(ge=0); proteinG: float = Field(ge=0); costInr: float = Field(ge=0); cookMin: int = Field(ge=0); tags: list[str]; familyShareable: bool
class Targets(StrictModel): kcal: float = Field(ge=0); proteinG: float = Field(ge=0)
class Totals(Targets): costInr: float = Field(ge=0)
class MealPlan(StrictModel): date: date; meals: list[Meal]; targets: Targets; totals: Totals
class PlanResponse(StrictModel): plans: list[DayPlan]
