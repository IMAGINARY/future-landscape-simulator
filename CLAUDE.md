# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

future-landscape-simulator is an interactive city-planning simulation exhibit built as a variant of the Future Mobility Simulator. It allows users to simulate urban landscape decisions and observe environmental, economic, and social impacts using Pixi.js graphics rendering.

**Key architecture pattern:** The project uses composition where the base future-mobility framework is cloned from GitHub during build, and customizations in `extras/` are copied on top.

## Development Commands

```bash
# Full build (clones base, applies extras, builds)
npm run build

# Development - run both in separate terminals
npm run watch:copy      # Watch extras/, copy changes to future-mobility/
npm run watch:compile   # Watch and recompile TypeScript/SASS

# Run server
npm run server
```

Node.js >= 24.4.1 required.

## Code Structure

All project-specific code lives in `extras/`:

```
extras/
├── config/              # YAML configuration (power-ups, tiles, goals, etc.)
├── src/
│   ├── js/lib/
│   │   ├── init/        # Initialization modules
│   │   ├── data-sources/ # Core business logic (8 classes)
│   │   ├── tile-renderers/
│   │   ├── view-pixi/
│   │   ├── model/
│   │   └── helpers/
│   └── sass/            # SCSS stylesheets
├── static/              # Images, icons, textures
└── data/                # Game data files
```

## Data Source Architecture

The simulation uses abstract `DataSource` class extended by 8 concrete implementations:
- `FoodProductionData`, `BiodiversityData`, `CarbonData`, `PopulationData`
- `QualityOfLifeData`, `EconomicGrowthData`, `UrbanData`, `DensityData`

Each data source implements:
- `getVariables()` - returns observable state
- `calculate()` - updates state based on map tiles
- `getGoals()` - returns goal objects with progress tracking

Data sources use `Array2D` for 2D map calculations and apply modifier bonuses from the power-ups system.

## Configuration System

All configuration uses YAML files in `extras/config/`:
- `power-ups.yml` - Power-up definitions with bonuses (food-production-bonus, biodiversity-bonus, carbon-bonus)
- `tiles.yml` - Tile type definitions with production/biodiversity values
- `goals.yml` - Goal definitions and thresholds
- Index thresholds typically range 1-5, determined by meeting multiple conditions

## Key Patterns

- CommonJS modules (`require()`/`module.exports`)
- File naming: kebab-case (`init-map-modes.js`)
- `IntervalMapper` helper parses mathematical interval notation `[min,max)` for value mapping
- Modifiers from power-ups target specific tile types (crops, livestock, forests)

## ESLint Configuration

- Extends Airbnb style guide
- Trailing commas: always on multiline (except functions)
- `no-param-reassign` allows property mutations (`props: false`)

## Commit Convention

Uses conventional commits: `feat:` and `fix:` prefixes.
