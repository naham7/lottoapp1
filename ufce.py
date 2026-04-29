from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from math import cos, exp, floor, pi, sin, sqrt


LAYERS = [
    "Universal Constant Field",
    "Celestial Map",
    "Zodiac Grid",
    "Saju Five Element Field",
    "Biometric Cycles",
    "Numerology",
    "Event Gravity",
    "Causality Compensation",
    "Limited Entropy",
]

ZODIAC_AXES = [
    ("Aries", 1, 3, "volatility"),
    ("Taurus", 4, 6, "stability"),
    ("Gemini", 7, 9, "duality"),
    ("Cancer", 10, 12, "accumulation"),
    ("Leo", 13, 15, "peak"),
    ("Virgo", 16, 18, "precision"),
    ("Libra", 19, 21, "balance"),
    ("Scorpio", 22, 24, "compression"),
    ("Sagittarius", 25, 27, "expansion"),
    ("Capricorn", 28, 30, "density"),
    ("Aquarius", 31, 36, "anomaly"),
    ("Pisces", 37, 45, "diffusion"),
]

ELEMENTS = ["Wood", "Fire", "Earth", "Metal", "Water"]


@dataclass(frozen=True)
class Event:
    name: str
    magnitude: float
    decay: float
    distance: float


@dataclass(frozen=True)
class UFCEInput:
    birth_date: str
    birth_time: str
    birth_location: str
    timestamp: str
    events: tuple[Event, ...]
    recent_draws: tuple[int, ...]


def fract(value: float) -> float:
    return value - floor(value)


def normalize_wave(value: float) -> float:
    return (sin(value) + cos(value * 0.61803398875) + 2) / 4


def hash_string(text: str) -> int:
    h = 2166136261
    for char in text:
        h ^= ord(char)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def deterministic_noise(seed: int, index: int) -> float:
    return fract(abs(sin((seed + 1) * (index + 17) * 12.9898) * 43758.5453))


def constant_field(seed: int) -> float:
    phi = (1 + sqrt(5)) / 2
    constants = f"{pi}{2.718281828459045}{phi}299792458384400"
    digits = [int(char) for char in constants if char.isdigit()]
    total = sum(digit * normalize_wave(seed / (index + 3)) for index, digit in enumerate(digits))
    return fract(total / len(digits))


def celestial_map(now: datetime) -> float:
    day = int(now.strftime("%j"))
    bodies = [88, 225, 365.256, 687, 4332.59, 10759.22, 30688.5]
    aspects = [90, 120, 180]
    field = 0.0
    resistance = 0.0
    for index, period in enumerate(bodies):
        angle = ((day % period) / period) * 360
        field += sin(angle * pi / 180) + cos((angle + index * 17) * pi / 180)
        for aspect in aspects:
            resistance += 1 / (1 + abs(((angle - aspect + 540) % 360) - 180))
    return normalize_wave(field + resistance * 9.7)


def zodiac_grid(month: int, day: int) -> tuple[float, tuple[str, int, int, str]]:
    ordinal = ((month * 31 + day) % 45) + 1
    axis = next((item for item in ZODIAC_AXES if item[1] <= ordinal <= item[2]), ZODIAC_AXES[0])
    return normalize_wave(ordinal * axis[1] + axis[2]), axis


def saju_field(year: int, month: int, day: int, hour: int) -> tuple[float, list[float]]:
    stems = [year % 10, month % 10, day % 10, hour % 10]
    branches = [year % 12, month % 12, day % 12, hour % 12]
    forces = []
    for index in range(5):
        stem_force = sum(1 for value in stems if value % 5 == index)
        branch_force = sum(1 for value in branches if value % 5 == index)
        forces.append(stem_force * 1.2 + branch_force)
    total = sum(forces) or 1
    vector = [value / total for value in forces]
    value = sum(force * sin((index + 1) * 1.618) for index, force in enumerate(vector))
    return normalize_wave(value * 9), vector


def biometric_cycles(birth: datetime, now: datetime) -> float:
    age_days = max(1, (now - birth).days)
    physical = sin((2 * pi * age_days) / 23)
    emotional = sin((2 * pi * age_days) / 28)
    intellectual = sin((2 * pi * age_days) / 33)
    return normalize_wave(physical * 1.4 + emotional + intellectual * 1.2)


def numerology_field(year: int, month: int, day: int) -> float:
    root = sum(int(char) for char in f"{year}{month}{day}")
    harmonic = sum(sin((root * (index + 1)) / 9) for index in range(9))
    return normalize_wave(harmonic)


def event_gravity(events: tuple[Event, ...]) -> float:
    gravity = 0.0
    for index, event in enumerate(events):
        well = event.magnitude * exp(-event.decay * event.distance)
        gravity += well * sin((index + 1) * 2.399)
    return normalize_wave(gravity * 4)


def causality_repulsion(draws: tuple[int, ...]) -> float:
    if not draws:
        return 0.11
    frequency: dict[int, int] = {}
    for number in draws:
        frequency[number] = frequency.get(number, 0) + 1
    pressure = sum((count / len(draws)) * normalize_wave(number * count) for number, count in frequency.items())
    return min(0.82, pressure)


def build_field(data: UFCEInput, variant: int = 0) -> dict:
    year, month, day = (int(part) for part in data.birth_date.split("-"))
    hour = int((data.birth_time or "00:00")[:2])
    now = datetime.fromisoformat(data.timestamp)
    birth = datetime.fromisoformat(f"{data.birth_date}T{data.birth_time or '00:00'}")
    seed = hash_string(f"{data.birth_date}|{data.birth_time}|{data.birth_location}|{data.timestamp}|{variant}")
    zodiac_value, axis = zodiac_grid(month, day)
    saju_value, saju_vector = saju_field(year, month, day, hour)
    layers = [
        constant_field(seed),
        celestial_map(now),
        zodiac_value,
        saju_value,
        biometric_cycles(birth, now),
        numerology_field(year, month, day),
        event_gravity(data.events) * (1.28 if variant == 1 else 1),
        -causality_repulsion(data.recent_draws),
        (deterministic_noise(seed, 91) * 0.2 + 0.15) * (1.18 if variant == 2 else 1),
    ]
    weights = [0.14, 0.13, 0.1, 0.11, 0.11, 0.1, 0.13, 0.1, 0.08]
    base = sum(layer * weights[index] * 9 for index, layer in enumerate(layers))
    final = base * sin(base + variant * 0.777)
    return {"final": final, "layers": layers, "weights": weights, "axis": axis, "saju_vector": saju_vector, "seed": seed}


def dominant_layer(field: dict, offset: int) -> str:
    scores = [
        abs(sin(layer * (offset + 1) * 9.41) * field["weights"][index])
        for index, layer in enumerate(field["layers"])
    ]
    return LAYERS[scores.index(max(scores))]


def extract_set(field: dict, label: str, scale: float) -> dict:
    numbers: list[int] = []
    traces: list[tuple[int, str]] = []
    cursor = 0
    while len(numbers) < 6 and cursor < 90:
        layer_pulse = field["layers"][cursor % len(field["layers"])]
        raw = abs((field["final"] + layer_pulse) * (cursor + 1) * scale + deterministic_noise(field["seed"], cursor) * 45)
        number = int(raw % 45) + 1
        if number not in numbers:
            numbers.append(number)
            traces.append((number, dominant_layer(field, cursor)))
        cursor += 1
    numbers.sort()
    bonus = int(abs(field["final"] * scale * 1.909 + deterministic_noise(field["seed"], 700) * 45) % 45) + 1
    while bonus in numbers:
        bonus = (bonus % 45) + 1
    return {"label": label, "numbers": numbers, "bonus": bonus, "traces": traces}


def run_engine(data: UFCEInput) -> dict:
    fields = [build_field(data, variant) for variant in range(3)]
    sets = [
        extract_set(fields[0], "Deterministic Set", 777.31),
        extract_set(fields[1], "Event-Distorted Set", 913.17),
        extract_set(fields[2], "Resonance Set", 1088.53),
    ]
    contribution_basis = [abs(layer * fields[0]["weights"][index]) for index, layer in enumerate(fields[0]["layers"])]
    total = sum(contribution_basis) or 1
    contributions = [(LAYERS[index], round((value / total) * 100)) for index, value in enumerate(contribution_basis)]
    lookup = dict(contributions)
    alignment = round(min(100, max(0, abs(sin(fields[0]["final"])) * 72 + lookup["Celestial Map"] + lookup["Event Gravity"] * 0.65)))
    instability = round(min(100, max(0, lookup["Event Gravity"] * 1.7 + lookup["Limited Entropy"] * 2.4 - lookup["Saju Five Element Field"] * 0.5)))
    now = datetime.fromisoformat(data.timestamp)
    next_window = now + timedelta(minutes=45 + round(abs(fields[0]["final"]) * 137))
    return {
        "sets": sets,
        "contributions": contributions,
        "alignment": alignment,
        "instability": instability,
        "next_window": next_window,
        "axis": fields[0]["axis"],
        "saju_vector": dict(zip(ELEMENTS, fields[0]["saju_vector"])),
    }


if __name__ == "__main__":
    sample = UFCEInput(
        birth_date="1995-10-11",
        birth_time="03:33",
        birth_location="Seoul",
        timestamp=datetime.now().isoformat(timespec="milliseconds"),
        events=(
            Event("economic crisis", 0.72, 0.17, 11),
            Event("global tech breakthrough", 0.64, 0.09, 4),
            Event("major sports finals", 0.46, 0.21, 2),
        ),
        recent_draws=(3, 7, 12, 19, 33, 41, 5, 11, 18, 24, 32, 45, 2, 9, 16, 28, 36, 44),
    )
    result = run_engine(sample)
    print("UFCE LOTTO COORDINATES")
    for item in result["sets"]:
        print(f"{item['label']}: {item['numbers']} + Bonus {item['bonus']}")
    print(f"Dominant axis: {result['axis'][0]} / {result['axis'][3]}")
    print(f"Alignment score: {result['alignment']}/100")
    print(f"Instability index: {result['instability']}/100")
    print(f"Next optimal window: {result['next_window'].isoformat(timespec='minutes')}")
    print("Contribution table:")
    for layer, percent in result["contributions"]:
        print(f"  {layer}: {percent}%")
