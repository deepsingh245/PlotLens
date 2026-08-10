# PlotLens — UI/UX Design Workflow

> **Purpose:** This document defines the complete design workflow for PlotLens before implementation begins.
>
> The goal is to prevent the coding AI from inventing a generic SaaS dashboard. PlotLens is a **map-first property/GIS investigation workspace**, so the UX, interaction model, and design system must be established before production code.

---

# 1. Product Design Principle

PlotLens should feel like:

> **A lightweight professional GIS investigation workspace designed for property research.**

It should NOT feel like:

- a generic admin dashboard,
- a spreadsheet,
- a social application,
- a form-heavy property CRM,
- a generic AI chat application.

The map is the primary workspace.

The interface should support the map rather than compete with it.

---

# 2. Core UX Philosophy

Permanent design principles:

```text
1. Map first.
2. Clarity over decoration.
3. Fewer clicks.
4. Contextual controls.
5. Private by default.
6. Source-aware information.
7. Visual hierarchy.
8. Desktop-first for serious GIS work.
9. Mobile-friendly for field/reference use.
10. Every action should be reversible where practical.
11. Never hide important map information behind unnecessary modals.
12. Don't make uncertain GIS data look legally authoritative.
```

---

# 3. Golden User Journey

The main PlotLens workflow is:

```text
CREATE PROJECT
      ↓
CHOOSE LOCATION
      ↓
OPEN MAP
      ↓
ENABLE / ADD LAYERS
      ↓
IMPORT IMAGE / OLD MAP
      ↓
ALIGN OVERLAY
      ↓
DROP PINS / DRAW AREAS
      ↓
ADD NOTES
      ↓
MEASURE DISTANCE / AREA
      ↓
COMPARE SOURCES
      ↓
SAVE INVESTIGATION
      ↓
EXPORT / SHARE
```

Every major design decision should make this journey faster and clearer.

---

# 4. Design Pipeline

Use the following sequence.

```text
01. Product Understanding
        ↓
02. UX Research
        ↓
03. Information Architecture
        ↓
04. User Flows
        ↓
05. Low-Fidelity Wireframes
        ↓
06. High-Fidelity UI
        ↓
07. Design System
        ↓
08. Interactive Prototype
        ↓
09. UX Review
        ↓
10. Accessibility Review
        ↓
11. Developer Handoff
        ↓
12. Implementation
        ↓
13. Visual QA
        ↓
14. Iterate
```

Do not skip directly from product idea to implementation.

---

# 5. Stage 01 — Product Understanding

Before designing screens, read:

```text
PlotLens_Project_Specification.md
PlotLens_PreDevelopment_Readiness_Checklist.md
PlotLens_Security_Privacy_Compliance_Checklist.md
```

The designer/AI must understand:

```text
What PlotLens is
Who uses it
Why it exists
What the MVP contains
What data it handles
What map providers may be used
What government data may be used
What security restrictions exist
What legal/compliance restrictions exist
```

### Output

Create:

```text
docs/design/PRODUCT_DESIGN_BRIEF.md
```

---

# 6. Stage 02 — UX Research

Research existing products and workflows.

Study:

```text
QGIS
ArcGIS
Google Earth
Google Maps
Mapbox
MapLibre-based applications
Mappls
Bhuvan
property research tools
land/property GIS workflows
```

Do not copy their UI blindly.

Study:

```text
How layers work
How map tools work
How measurements work
How overlays work
How annotations work
How users navigate large maps
How source information is displayed
How mobile map workflows work
```

### Research output

Create:

```text
docs/design/UX_RESEARCH.md
```

---

# 7. Stage 03 — User Personas

Initial persona:

## Property Investigator

Typical goals:

```text
Find land
Inspect nearby roads
Compare old/new maps
Check government projects
Mark candidate properties
Measure land
Save notes
Compare multiple sources
Export findings
```

Typical frustrations:

```text
Too many map websites
Different data sources
Hard-to-align old maps
Poor satellite/map comparison
Manual measurements
No single investigation workspace
```

Design primarily for this persona.

---

# 8. Stage 04 — Information Architecture

Recommended top-level structure:

```text
PlotLens
│
├── Projects
│
├── Project
│   ├── Map
│   ├── Layers
│   ├── Overlays
│   ├── Annotations
│   ├── Measurements
│   ├── Sources
│   └── Export
│
└── Settings
```

The user should spend most of their time inside:

```text
Project → Map
```

---

# 9. Stage 05 — Primary Screens

Design these first.

```text
01. Welcome / Landing
02. Projects
03. New Project
04. Map Workspace
05. Layers Panel
06. Add Image Overlay
07. Align Image Overlay
08. Annotation
09. Measurement
10. Source Details
11. Export
12. Project Settings
```

Do not design dozens of secondary screens before the core map workflow works.

---

# 10. Screen 01 — Projects

Purpose:

> Quickly resume or create an investigation.

Suggested structure:

```text
┌───────────────────────────────────────────────┐
│ PlotLens                         + New Map    │
│                                               │
│ Your investigations                           │
│                                               │
│ ┌─────────────────┐ ┌─────────────────┐       │
│ │ Ring Road       │ │ Govt Project    │       │
│ │ Ahmedabad       │ │ Agra            │       │
│ │ 12 layers       │ │ 6 layers        │       │
│ └─────────────────┘ └─────────────────┘       │
│                                               │
└───────────────────────────────────────────────┘
```

Keep it simple.

No unnecessary analytics dashboard.

---

# 11. Screen 02 — New Project

Minimum fields:

```text
Project name
Location
Optional description
```

Possible future options:

```text
Base map
Default coordinate system
Project type
```

Do not make project creation feel like filling out a government form.

Target:

```text
Create project → map opens
```

---

# 12. Screen 03 — Map Workspace

This is the most important screen.

Recommended layout:

```text
┌──────────────────────────────────────────────────────────┐
│ PlotLens   Search location...            Share  Export   │
├──────────────┬───────────────────────────────┬───────────┤
│              │                               │           │
│ PROJECT      │                               │   TOOLS   │
│              │                               │           │
│ Layers       │                               │   Pin     │
│              │             MAP               │   Line    │
│ Base Map     │                               │   Polygon │
│ Roads        │                               │   Measure │
│ Parcels      │                               │   Note    │
│ Boundaries   │                               │   Overlay │
│ Govt data    │                               │   Export  │
│              │                               │           │
│ Overlays     │                               │           │
│ Old map      │                               │           │
│ Survey       │                               │           │
│              │                               │           │
└──────────────┴───────────────────────────────┴───────────┘
```

### Critical rule

Both sidebars must be collapsible.

The map must be able to become nearly full-screen.

---

# 13. Map Interaction Model

The map should behave like a canvas.

Avoid:

```text
Click tool
↓
Open modal
↓
Configure
↓
Close modal
↓
Start drawing
```

Prefer:

```text
Click Measure
↓
Cursor changes
↓
Draw on map
↓
Live result
↓
Finish
```

Use the same philosophy for:

```text
Pin
Line
Polygon
Measure
Note
```

---

# 14. Map Tool Set

Initial tools:

```text
Pin
Line
Polygon
Measure Distance
Measure Area
Note
Image Overlay
Export
```

Future:

```text
Circle
Radius
Buffer
Route
Coordinate conversion
Split polygon
Merge polygon
Elevation
Parcel lookup
Street/road analysis
```

Do not implement future tools before the MVP workflow is stable.

---

# 15. Layers UX

Layers should behave like professional GIS layers but remain understandable to non-GIS users.

Example:

```text
LAYERS

Base Map
  ◉ Satellite
  ○ Streets

Government
  ☑ Proposed Roads
  ☑ Master Plan
  ☐ Zoning
  ☐ Parcels

Your Data
  ☑ My Properties
  ☑ Annotations
  ☑ Measurements

Overlays
  ☑ 1995 Survey Map      42%
  ☐ Old Newspaper Map    35%
```

Each layer should eventually support:

```text
visibility
opacity
rename
reorder
metadata
source
date
legend
```

---

# 16. Image Overlay UX

This is one of PlotLens's signature features.

Flow:

```text
Add Image Overlay
        ↓
Select Image
        ↓
Image appears over map
        ↓
Adjust position
        ↓
Adjust scale
        ↓
Adjust rotation
        ↓
Adjust opacity
        ↓
Lock
        ↓
Save
```

Controls:

```text
Opacity     ───────●──── 42%

Rotation    ↺

Scale       + ─────── -

Move        ↔ ↑ ↓

Lock        🔒

Blend       Normal / Multiply / Screen

Visibility  👁
```

---

# 17. Image Alignment

Support visual alignment.

Concept:

```text
●────────────●
│            │
│    IMAGE   │
│            │
●────────────●
```

Allow anchor/corner manipulation where practical.

Future advanced feature:

```text
Control Point 1
Control Point 2
Control Point 3
Control Point 4
```

This can evolve into more precise georeferencing.

---

# 18. Annotation UX

Clicking an annotation should open a contextual panel.

Example:

```text
┌─────────────────────────┐
│ Land Parcel A        ×  │
├─────────────────────────┤
│ Location                │
│ 27.XXXX, 78.XXXX       │
│                         │
│ Area                    │
│ 12,345 m²               │
│                         │
│ Notes                   │
│ Potential acquisition   │
│                         │
│ Photos                  │
│ [img] [img] [img]       │
│                         │
│ Sources                 │
│ Govt Road Plan          │
│ Survey Map              │
│                         │
│ Edit        Delete      │
└─────────────────────────┘
```

Do not force the user onto a separate page for simple annotation edits.

---

# 19. Measurement UX

Measurement should be immediate.

Distance:

```text
Measure
↓
Click A
↓
Move cursor
↓
Live distance
↓
Click B
↓
Finish
```

Area:

```text
Measure Area
↓
Click points
↓
Polygon appears
↓
Live area
↓
Finish
```

Display:

```text
Distance
125.4 m

Area
12,345 m²
1.23 hectares
```

Allow unit preferences later.

---

# 20. Source-Aware UX

Every external layer should expose source information.

Example:

```text
Source
Government Dataset

Dataset
Proposed Road Network

Published
2025

Last checked
Aug 10, 2026

License
Government Open Data License — India

Notes
Source accuracy may vary.
```

This is important for:

```text
trust
research
compliance
future audits
```

---

# 21. Uncertainty Visualization

Do not make all data appear equally authoritative.

Possible visual language:

```text
Official source
───────────────

User-drawn
- - - - - - - -

Approximate
· · · · · · · ·

Historical overlay
───────────────
```

When selecting a layer, explain what it represents.

Never visually imply that a user-drawn boundary is a legal property boundary.

---

# 22. Contextual Panels

Prefer contextual side panels over repeated modal dialogs.

Example:

```text
Click layer
    ↓
Layer details panel

Click annotation
    ↓
Annotation panel

Click source
    ↓
Source panel

Click measurement
    ↓
Measurement panel
```

Use modals only when the action genuinely requires focused confirmation.

---

# 23. Search UX

Primary search should support:

```text
place name
address
coordinates
landmark
PIN code
```

Future:

```text
parcel ID
project name
saved annotation
```

Search should move the map rather than navigate away from it.

---

# 24. Project State

A project should remember:

```text
map center
zoom
rotation
active layers
layer opacity
selected overlay
annotations
measurements
last selected tool
```

When reopening:

> The user should return to where they left off.

---

# 25. Mobile Strategy

Desktop is the primary serious GIS experience.

Mobile should support:

```text
view map
open projects
toggle layers
drop pins
draw
measure
add notes
take/upload photos
inspect annotations
```

Avoid forcing desktop-level layer management onto mobile.

---

# 26. Mobile Map UI

Use bottom tools:

```text
┌──────────────────────┐
│       MAP            │
│                      │
│         📍           │
│                      │
│                      │
├──────────────────────┤
│ Pin  Draw  Measure   │
│ Layers       More    │
└──────────────────────┘
```

Bottom sheets are preferable to permanent sidebars on mobile.

---

# 27. Empty States

Every major area needs an intentional empty state.

Examples:

```text
No projects yet
→ Create your first investigation

No overlays
→ Add an old map or survey image

No annotations
→ Drop a pin or draw an area

No layers
→ Add a data source
```

Do not leave empty white/black panels.

---

# 28. Loading States

Map loading:

```text
Loading map…
```

Layer loading:

```text
Loading Proposed Roads…
```

Overlay processing:

```text
Preparing image…
```

GIS import:

```text
Processing 1,248 features…
```

Long operations should show progress or meaningful status.

---

# 29. Error States

Errors should explain:

```text
What happened
Why it happened if known
What the user can do
```

Bad:

```text
Error 500
```

Better:

```text
This government layer is temporarily unavailable.

Your project is safe.
Try again later or hide this layer.
```

---

# 30. Undo / Redo

Important for drawing tools.

Support:

```text
Undo
Redo
```

especially for:

```text
polygon drawing
line drawing
annotation editing
overlay positioning
```

Keyboard:

```text
Ctrl/Cmd + Z
Ctrl/Cmd + Shift + Z
```

---

# 31. Keyboard Shortcuts

Potential shortcuts:

```text
P = Pin
L = Line
G = Polygon
M = Measure
N = Note
O = Overlay
Esc = Cancel current tool
Space = Pan
Delete = Delete selected
Ctrl/Cmd + Z = Undo
Ctrl/Cmd + Shift + Z = Redo
```

Show shortcuts in tooltips.

---

# 32. Visual Design Direction

Recommended visual direction:

```text
Dark-first
Map-centric
Minimal
Professional
High contrast
Subtle borders
Soft rounded surfaces
Bright accent color
Very little visual noise
```

Suggested palette direction:

```text
Background       #0B0D0F
Surface          #11151A
Surface Elevated #171C22
Border           #252B33
Text Primary     #F5F7FA
Text Secondary   #A7AFBA
Accent           #B8FF52
```

The map remains visually dominant.

Do not cover the map with oversized UI panels.

---

# 33. Typography

Use a clean modern UI font.

Possible:

```text
Inter
Geist
Manrope
```

Hierarchy:

```text
Page title
Section title
Tool title
Body
Metadata
Caption
```

Avoid excessive font sizes.

---

# 34. Design Tokens

Create tokens before implementation.

```text
colors
spacing
radius
shadows
typography
icon sizes
control heights
z-index
animation duration
```

Example:

```text
radius-sm
radius-md
radius-lg

space-1
space-2
space-3
space-4
space-6
space-8
```

---

# 35. Component System

Build reusable components:

```text
Button
IconButton
Tooltip
Search
Panel
Drawer
BottomSheet
LayerRow
LayerGroup
MapTool
AnnotationCard
SourceCard
PropertyCard
MeasurementCard
Slider
Toggle
Tabs
Dropdown
CommandMenu
Toast
Dialog
FileUploader
```

Map-specific components:

```text
MapToolbar
LayerControl
OverlayControl
CoordinateDisplay
ScaleBar
Compass
ZoomControl
SelectionPanel
MeasurementOverlay
AnnotationPopup
```

---

# 36. Accessibility

Minimum:

```text
Keyboard navigation
Focus states
Visible labels
ARIA labels for icon-only buttons
Readable contrast
Tooltips
Screen-reader names
Reduced-motion support
```

Do not rely only on color to communicate state.

Example:

```text
Visible + icon + label
```

rather than:

```text
Green = enabled
Grey = disabled
```

---

# 37. Responsive Design

Define breakpoints intentionally.

Desktop:

```text
≥ 1280px
```

Tablet:

```text
768px – 1279px
```

Mobile:

```text
< 768px
```

Do not simply shrink the desktop UI.

Each breakpoint gets its own interaction strategy.

---

# 38. Animation

Use animation sparingly.

Good:

```text
panel open
panel close
selection
tool activation
toast
bottom sheet
```

Avoid:

```text
constant map animations
large decorative transitions
slow navigation
```

The application should feel fast.

---

# 39. Figma File Structure

Recommended Figma structure:

```text
PlotLens
│
├── 00 — Cover
├── 01 — Foundations
├── 02 — Design Tokens
├── 03 — Components
├── 04 — Desktop
├── 05 — Mobile
├── 06 — Map Interactions
├── 07 — Prototypes
├── 08 — User Flows
└── 09 — Developer Handoff
```

---

# 40. Figma Component Naming

Use consistent names:

```text
Button/Primary
Button/Secondary
Button/Icon
Panel/Default
Panel/MapTools
Layer/Default
Layer/Active
Layer/Disabled
Annotation/Card
Measurement/Distance
Measurement/Area
Overlay/Control
```

Variants should be explicit.

---

# 41. Prototype Before Coding

At minimum, prototype this complete journey:

```text
Projects
 ↓
New Project
 ↓
Map
 ↓
Search location
 ↓
Enable layer
 ↓
Add image
 ↓
Adjust opacity
 ↓
Move image
 ↓
Drop pin
 ↓
Add note
 ↓
Measure area
 ↓
Save
 ↓
Reopen project
 ↓
Export
```

If this journey feels awkward in the prototype, do not start implementation.

---

# 42. UX Review Questions

Before approval ask:

```text
Can a new user understand the map within 30 seconds?

Can they create a project without instructions?

Can they find the layer controls?

Can they add an image overlay?

Can they adjust opacity?

Can they move the overlay?

Can they drop a pin?

Can they measure land?

Can they find the source of a layer?

Can they undo a mistake?

Can they reopen their previous investigation?

Can they export it?

Can they use the map with the sidebars collapsed?
```

---

# 43. Design Review — Security

Before handoff:

```text
[ ] No private information exposed by default
[ ] Sharing clearly disabled/default-private
[ ] File upload UX communicates supported types
[ ] Sensitive document warnings where needed
[ ] External-source information visible
[ ] Public/private states explicit
```

---

# 44. Design Review — Compliance

Before handoff:

```text
[ ] Source attribution has a UI location
[ ] Dataset license can be displayed
[ ] Source date can be displayed
[ ] User-generated boundaries are distinguishable
[ ] Approximate/official data can be distinguished
[ ] Public sharing doesn't automatically expose private attachments
[ ] Export includes source metadata where appropriate
```

---

# 45. Design Review — GIS

```text
[ ] Coordinate display
[ ] Scale bar
[ ] North/compass
[ ] Zoom controls
[ ] Layer ordering
[ ] Opacity
[ ] Map selection
[ ] Drawing
[ ] Measurement
[ ] Overlay alignment
[ ] CRS/coordinate information where relevant
```

---

# 46. AI Design Workflow

Use AI as a design collaborator, not an autonomous product designer.

Recommended sequence:

```text
Product Spec
     ↓
UX Architecture
     ↓
Wireframes
     ↓
Figma Make
     ↓
Interactive Prototype
     ↓
Human Review
     ↓
Design System
     ↓
Approved Design
     ↓
Coding AI
```

---

# 47. Recommended AI / Design Tools

## Primary

### Figma + Figma Make

Use for:

```text
UX
Wireframes
UI
Design system
Interactive prototypes
Design iteration
```

Recommended starting point:

```text
https://www.figma.com/make/
```

---

## Secondary

### v0

Use after the design direction is approved.

Good for:

```text
React UI
Responsive components
UI implementation
Visual iteration
```

Do not let v0 define PlotLens's entire UX from scratch.

---

## Coding Agent

After design approval:

```text
Cursor
Claude Code
GitHub Copilot
Gemini / Google coding tools
```

The coding agent must receive:

```text
PROJECT_SPECIFICATION
PREDEVELOPMENT_CHECKLIST
SECURITY_COMPLIANCE_CHECKLIST
UX_SPECIFICATION
DESIGN_SYSTEM
FIGMA_REFERENCE
```

---

# 48. AI Handoff Package

Before coding starts, create:

```text
docs/design/
├── UX_SPECIFICATION.md
├── USER_FLOWS.md
├── DESIGN_SYSTEM.md
├── COMPONENTS.md
├── RESPONSIVE_RULES.md
├── ACCESSIBILITY.md
├── MAP_INTERACTIONS.md
└── FIGMA_HANDOFF.md
```

The coding AI must read these before modifying UI.

---

# 49. Coding AI UI Rules

Add to `AGENTS.md`:

```text
UI/UX RULES

1. Do not invent new layouts without checking UX_SPECIFICATION.md.
2. Do not create generic SaaS dashboard patterns.
3. The map is the primary workspace.
4. Preserve the approved information architecture.
5. Reuse design-system components.
6. Do not introduce arbitrary colors.
7. Do not introduce arbitrary spacing.
8. Keep sidebars collapsible.
9. Prefer contextual panels over unnecessary modals.
10. Preserve keyboard accessibility.
11. Preserve mobile behavior.
12. Do not change interaction behavior without updating the UX documentation.
13. Do not replace a Figma-approved design with an unrelated implementation.
14. Any major UX change requires review before implementation.
```

---

# 50. Implementation Pipeline

Once design is approved:

```text
Figma
  ↓
Design tokens
  ↓
UI primitives
  ↓
Layout shell
  ↓
Map shell
  ↓
Layers
  ↓
Map tools
  ↓
Annotations
  ↓
Measurements
  ↓
Image overlays
  ↓
Sources
  ↓
Export
  ↓
Mobile
  ↓
Accessibility
  ↓
Visual QA
```

Do not implement everything at once.

---

# 51. Recommended Development Order

## Phase 1 — Shell

```text
App shell
Navigation
Project list
Project creation
```

## Phase 2 — Map

```text
MapLibre
Base map
Search
Zoom
Compass
Scale
```

## Phase 3 — Layers

```text
Layer list
Visibility
Opacity
Ordering
Source metadata
```

## Phase 4 — Drawing

```text
Pin
Line
Polygon
Selection
Delete
Undo/redo
```

## Phase 5 — Measurements

```text
Distance
Area
Units
Measurement persistence
```

## Phase 6 — Image Overlays

```text
Upload
Display
Opacity
Move
Scale
Rotate
Lock
Persistence
```

## Phase 7 — Notes

```text
Annotation
Photos
Metadata
Source references
```

## Phase 8 — External Data

```text
Government layers
Provider adapters
Source metadata
Attribution
```

## Phase 9 — Export

```text
PNG
PDF
GeoJSON
KML/KMZ
Project backup
```

## Phase 10 — Mobile

```text
Responsive map
Bottom sheets
Mobile tools
Photo capture/upload
```

---

# 52. Visual QA

After implementation, compare:

```text
Figma
vs
Actual application
```

Check:

```text
spacing
font
colors
icons
border radius
panel dimensions
map area
tool placement
responsive behavior
hover
focus
active states
loading
errors
```

Do not accept:

> "It is approximately the same."

Aim for consistent implementation of the approved design system.

---

# 53. User Testing

For the first prototype, give a user only this task:

> "Find a property area, add an old image/map, align it with the current map, mark a candidate area, measure it, add a note, and save the project."

Do not explain how.

Observe:

```text
Where do they hesitate?
What do they click?
What do they misunderstand?
What do they expect?
What do they miss?
```

Then redesign.

---

# 54. MVP UX Definition

The MVP is successful if a user can:

```text
Create project
    ↓
Find location
    ↓
Navigate map
    ↓
Enable layers
    ↓
Upload old image
    ↓
Align image
    ↓
Drop pin
    ↓
Draw property area
    ↓
Measure area
    ↓
Add note
    ↓
Save
    ↓
Reopen
    ↓
Export
```

without needing a tutorial.

---

# 55. Future UX Opportunities

After MVP:

```text
Compare two map dates
Timeline slider
Swipe comparison
Split-screen maps
Georeferencing
Parcel lookup
Government project tracking
Road expansion analysis
Distance-to-road analysis
Distance-to-highway analysis
Land suitability scoring
Change detection
AI map assistant
AI document extraction
AI source summarization
Automated property research reports
```

These should not distract from the core investigation workflow.

---

# 56. Final Design Gate

Do not start serious development until these are approved:

```text
[ ] Product design brief
[ ] UX research
[ ] Information architecture
[ ] User flows
[ ] Wireframes
[ ] High-fidelity map workspace
[ ] Image-overlay workflow
[ ] Layer system
[ ] Annotation workflow
[ ] Measurement workflow
[ ] Mobile strategy
[ ] Design tokens
[ ] Components
[ ] Accessibility
[ ] Prototype
[ ] UX review
[ ] Security/compliance review
[ ] Figma handoff
```

---

# 57. Recommended Toolchain

For this project:

```text
RESEARCH
Browser + official docs

        ↓

UX / UI
Figma

        ↓

AI DESIGN
Figma Make

        ↓

PROTOTYPE
Figma Prototype

        ↓

OPTIONAL UI GENERATION
v0

        ↓

IMPLEMENTATION
React + TypeScript

        ↓

MAP
MapLibre GL JS

        ↓

STATE
Zustand / appropriate state layer

        ↓

BACKEND
Firebase

        ↓

GIS
Turf.js + appropriate GIS libraries

        ↓

TESTING
Unit + integration + visual + GIS tests
```

---

# 58. Final Rule

PlotLens should be designed in this order:

```text
USER
 ↓
WORKFLOW
 ↓
MAP
 ↓
LAYERS
 ↓
TOOLS
 ↓
DATA
 ↓
DETAILS
 ↓
EXPORT
 ↓
VISUAL POLISH
```

Not:

```text
Colors
 ↓
Cards
 ↓
Sidebar
 ↓
Dashboard
 ↓
"Where do we put the map?"
```

The map and the investigation workflow define the product.

The UI exists to make that investigation **fast, understandable, precise, and enjoyable**.
