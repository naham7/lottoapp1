# UFCE Lotto App

Unified Fate Coordinate Engine is a deterministic lotto-coordinate app. It converts constants, symbolic celestial cycles, zodiac axes, saju-style five-element vectors, biometric cycles, numerology, event gravity, recent draw repulsion, and limited measurement entropy into one field.

## Run

Open `index.html` in a browser.

For the Python reference engine:

```powershell
python ufce.py
```

## Architecture

The engine treats every input as a wave contribution:

```text
F = celestial_wave
  + constant_field
  + zodiac_axis
  + saju_vector
  + biometric_wave
  + numerology_freq
  + event_gravity
  - causality_repulsion

F_final = F * sin(F)
```

Six coordinates and one bonus coordinate are extracted from the final field. Duplicate coordinates are resolved by deterministic phase advancement.

This is a conceptual entertainment system, not a prediction guarantee.
