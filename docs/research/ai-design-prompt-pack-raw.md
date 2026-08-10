# PlotLens — AI Design & Prototyping Prompt Pack

> Complete reusable prompt pack for designing and prototyping PlotLens with Figma Make, Google Stitch, Claude Artifacts, and later a coding AI.

## 1. Recommended AI workflow

```text
PlotLens Project Documents
        ↓
   Figma Make
        ↓
 Primary UX + Prototype
        ↓
 Google Stitch
        ↓
 Alternative visual exploration
        ↓
 Human review
        ↓
 Claude
        ↓
 UX critique + refinement
        ↓
 Approved Figma design
        ↓
 Design system + handoff
        ↓
 Claude Code / Cursor / Copilot
        ↓
 Real application
```

### Tool roles

**Figma Make — primary**
- UX
- wireframes
- high-fidelity UI
- interactive prototypes
- design system
- visual iteration

**Google Stitch — alternative exploration**
- alternate layouts
- visual exploration
- second opinion on UI

**Claude — critic + prototype engineer**
- interactive prototype
- UX review
- GIS UX reasoning
- accessibility review
- refinement

**Coding AI**
- implementation only after the design is approved

---

## 2. Files to give the design AI

Attach these before starting:

```text
PlotLens_Project_Specification.md
PlotLens_PreDevelopment_Readiness_Checklist.md
PlotLens_Security_Privacy_Compliance_Checklist.md
PlotLens_UI_UX_Design_Workflow.md
```

Treat those documents as authoritative. If a generated idea conflicts with them, flag the conflict instead of silently changing the product.

---

# 3. MASTER DESIGN CONTEXT PROMPT

Use this first with Figma Make, Stitch, Claude, or another design AI.

```text
You are helping design a product called PlotLens.

PlotLens is a private, map-first property and land research workspace.

The core use case is:

A user finds an area/property and wants to investigate it using maps, satellite imagery, government/project layers, historical maps, personal photos, annotations, measurements and other geographic information.

The user may:

- create multiple map projects
- search for locations
- inspect satellite/street/base maps
- enable government or external GIS layers
- import old maps or survey images
- place those images on top of the current map
- change their opacity
- move, rotate and scale them
- align historical images with the current map
- drop pins
- draw lines and polygons
- measure distance
- measure area
- attach notes and photos
- keep track of the source of information
- compare different sources
- save the entire investigation
- export the investigation

This is initially a personal/private project, not a public commercial product.

The application must prioritize:

1. Map usability
2. Fast investigation workflows
3. Visual clarity
4. Source/provenance awareness
5. Privacy
6. Accuracy of interaction
7. Simple UX
8. Future extensibility

The map is the primary workspace.

DO NOT design this as a generic SaaS dashboard with a map placed inside it.

The product should feel closer to:

- a lightweight GIS workspace
- a professional map investigation tool
- a property research canvas
- a simplified QGIS/Google Earth style experience

but with a much simpler and more approachable interface.

Important product principle:

"The UI exists to support the investigation, not to compete with the map."

The attached project documents are authoritative context.

Read them before making design decisions.

Do not invent functionality that conflicts with those documents.

If you think a new feature would substantially improve the product, identify it as a proposed future feature rather than silently adding it.
```

---

# 4. PRIMARY FIGMA MAKE PROMPT

```text
# Build the PlotLens UX Prototype

Design and prototype the first complete version of PlotLens, a desktop-first map investigation application for property and land research.

Do not create a generic SaaS dashboard.

The product must be map-first.

The map is the central canvas and should occupy the majority of the screen.

## PRODUCT CHARACTER

PlotLens should feel:

- professional
- precise
- calm
- modern
- minimal
- spatial
- tool-oriented
- trustworthy
- fast

It should feel like a simplified professional GIS application designed for property investigators rather than GIS specialists.

Avoid:

- excessive cards
- dashboard analytics
- giant hero sections
- decorative gradients everywhere
- unnecessary charts
- excessive rounded containers
- generic SaaS layouts
- unnecessary modals
- overly colorful UI
- excessive text

The map should visually dominate.

## CORE USER JOURNEY

Prototype:

Projects
→ Create Project
→ Search Location
→ Open Map
→ Enable Layer
→ Add Image Overlay
→ Align Image
→ Change Opacity
→ Drop Pin
→ Draw Polygon
→ Measure Area
→ Add Note
→ Save Investigation
→ Reopen Project
→ Export

The prototype must make this flow clickable and understandable without a tutorial.

## PROJECTS SCREEN

Create a simple project browser.

Header:
PlotLens

Primary action:
+ New Map

Project cards contain:

- project name
- location
- last modified
- number of layers
- number of annotations
- small map preview

Do not turn this into a statistics dashboard.

## NEW PROJECT

Fields:

Project name
Location
Optional description

Primary button:

Create Project

After creation immediately open the map workspace.

## MAP WORKSPACE

This is the most important screen.

Top bar:

Left:
PlotLens
Project name

Center:
Location search

Right:
Save status
Share
Export
Project menu

Left sidebar:
Layers

Right toolbar:
Pin
Line
Polygon
Measure
Note
Image Overlay

Center:
Large map

The map should occupy approximately 70–85% of the usable viewport.

Both side panels must be collapsible.

When collapsed, the map should become almost full screen.

## MAP TOOLBAR

Use compact icon buttons with tooltips.

Tools:

Pin
Line
Polygon
Measure Distance
Measure Area
Note
Image Overlay

Selected tool must have an obvious active state.

Do not use huge buttons.

## MAP CONTROLS

Include:

Zoom in
Zoom out
Compass / north indicator
Scale bar
Current coordinates when appropriate

Keep controls visually quiet.

## LAYERS PANEL

Groups:

Base Map
- Streets
- Satellite

Government
- Proposed Roads
- Master Plan
- Zoning
- Parcels

My Data
- Properties
- Annotations
- Measurements

Overlays
- 1995 Survey Map
- Historical Map

Each layer should support:

visibility
opacity
reordering
source information

The layer UI must be understandable to a non-GIS expert.

## IMAGE OVERLAY

This is a signature PlotLens interaction.

When the user selects Add Image Overlay:

1. show upload
2. place the image over the map
3. allow direct manipulation

Controls:

Opacity
Rotation
Scale
Move
Lock
Visibility
Blend mode

Example:

Opacity ─────●── 42%

Rotation
↺

Scale
− ───── +

Lock
🔒

Blend
Normal
Multiply
Screen

The image must visibly sit above the map.

## IMAGE ALIGNMENT

Allow:

- move
- scale
- rotate
- opacity

Show the overlay boundary.

If possible, provide draggable corner/anchor controls.

Do not create a complicated GIS georeferencing workflow yet. This is an MVP prototype.

## ANNOTATIONS

When the user drops a pin, open a contextual information panel.

Example:

Land Parcel A

Location
27.XXXX, 78.XXXX

Area
12,345 m²

Notes
Potential acquisition

Photos
[image thumbnails]

Sources
Government Road Plan
Survey Map

Actions:

Edit
Delete

Do not navigate away from the map.

## DRAWING

Pin:
Click tool → click map → pin appears

Line:
Click tool → click points → finish → line persists

Polygon:
Click tool → click points → close polygon → polygon persists

All drawing operations support:

Undo
Cancel
Delete

## MEASUREMENT

Distance:

Click Measure
→ click starting point
→ move cursor
→ live distance
→ click endpoint
→ finish

Area:

Click Measure Area
→ draw polygon
→ live area
→ finish

Example:

12,345 m²
1.23 hectares

Use a small floating measurement label.

Do not open a modal just to display the measurement.

## SOURCE INFORMATION

Every external dataset/layer should have source metadata.

Example:

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

Keep this contextual and unobtrusive.

## UNCERTAINTY

Do not visually imply that every boundary is legally authoritative.

Differentiate:

Official source
User drawn
Approximate
Historical

Example:

Official = solid
User-drawn = dashed
Approximate = dotted

This is both a UX and trust requirement.

## VISUAL DESIGN

Dark-first professional interface.

Background:
#0B0D0F

Surface:
#11151A

Elevated:
#171C22

Border:
#252B33

Primary text:
#F5F7FA

Secondary text:
#A7AFBA

Accent:
#B8FF52

Use the accent mainly for active/selected states and important actions.

Do not make the entire interface neon.

Typography:
Inter or Geist.

## COMPONENT STYLE

Use:

- subtle borders
- small-to-medium corner radius
- compact controls
- high information density
- clear hierarchy

Avoid:

- huge cards
- excessive shadows
- giant rounded containers
- excessive glassmorphism
- unnecessary gradients

## RESPONSIVE DESIGN

Desktop is primary.

Mobile:
- full-screen map
- bottom sheets for layers/tools/details/overlay controls
- bottom toolbar: Pin, Draw, Measure, Layers, More

Do not simply shrink the desktop UI.

## INTERACTION PRINCIPLES

Prefer direct manipulation.

Bad:
Click Measure → Modal → Configure → Close → Draw

Good:
Click Measure → cursor changes → draw on map → live measurement → finish

Apply this to:
Pin
Line
Polygon
Overlay
Annotation

## STATES

Design empty states for:
- no projects
- no layers
- no overlays
- no annotations

Design meaningful loading states for:
- map loading
- layer loading
- image processing
- GIS import

Design human-readable error states.

Example:

"This government layer is temporarily unavailable.

Your project is safe.
Try again later or hide this layer."

## ACCESSIBILITY

Include:

- keyboard focus states
- visible labels
- ARIA-friendly icon buttons
- sufficient contrast
- tooltips
- reduced-motion consideration

Do not rely only on color to communicate states.

## KEYBOARD SHORTCUTS

P = Pin
L = Line
G = Polygon
M = Measure
N = Note
O = Overlay
Esc = Cancel
Delete = Delete selected
Ctrl/Cmd + Z = Undo
Ctrl/Cmd + Shift + Z = Redo

## PROTOTYPE REQUIREMENT

Demonstrate:

1. Open PlotLens.
2. Create "Agra Ring Road Investigation".
3. Search for an area.
4. Open the map.
5. Open Layers.
6. Enable Proposed Roads.
7. Add an old survey image.
8. Place it over the map.
9. Reduce opacity to approximately 40%.
10. Move and rotate it.
11. Drop a property pin.
12. Draw a polygon around a candidate property.
13. Measure its area.
14. Add a note.
15. Inspect source information.
16. Save.
17. Reopen the project.
18. Export.

Make every important part clickable.

Do not attempt every possible PlotLens feature.

Focus on making the core investigation experience excellent.

The most important screen is the map workspace.

The most important interaction is:

Map + Layers + Image Overlay + Annotation + Measurement

Generate the first high-fidelity interactive prototype now.
```

---

# 5. FIGMA MAKE — MAP WORKSPACE REFINEMENT

```text
The map workspace currently feels too much like a generic SaaS dashboard.

Redesign ONLY the map workspace.

Make the map substantially more dominant.

Reduce visual weight of the sidebars.

Make the left layer panel narrower.

Make the right tool rail compact.

Allow both panels to collapse completely.

When both are collapsed, the map should occupy almost the entire viewport.

Do not change the overall color palette or typography.

Do not add new features.

The goal is:

"professional GIS tool with minimal UI surrounding the map."

Keep existing interactions intact.
```

---

# 6. FIGMA MAKE — IMAGE OVERLAY REFINEMENT

```text
Focus only on the Image Overlay workflow.

Make this one of PlotLens's signature interactions.

Create a polished interaction where the user:

1. clicks Add Image Overlay
2. uploads an image
3. sees it appear above the map
4. adjusts opacity
5. drags it
6. rotates it
7. scales it
8. locks it
9. saves it

Add a small contextual floating control near the selected image.

Controls:

Opacity
Rotation
Scale
Move
Lock
Visibility
Blend mode

Add draggable corner/anchor handles.

Do not create a complicated georeferencing system yet.

The experience should feel like manipulating an image on a design canvas while still clearly being a geographic map.

Preserve the existing PlotLens design system.

Do not redesign unrelated screens.
```

---

# 7. FIGMA MAKE — LAYERS REFINEMENT

```text
Improve ONLY the PlotLens Layers panel.

The layer system should feel like a simplified professional GIS layer manager.

Create groups:

Base Map
Government
My Data
Overlays

Each layer needs:

visibility
name
source indicator
opacity access
selection state

Selected layers should expose additional controls without making every row visually heavy.

Allow:

show/hide
reorder
opacity
source details

Use subtle hierarchy rather than large cards.

The user should understand the entire layer stack within seconds.

Do not add dashboards, charts or unrelated controls.

Keep the map visible while the layer panel is open.
```

---

# 8. FIGMA MAKE — PREMIUM REFINEMENT

Only use after functionality and interaction design are correct.

```text
Now perform a visual refinement pass on PlotLens.

Do NOT redesign the information architecture.

Do NOT add features.

Do NOT change the core workflows.

Improve:

- typography
- spacing
- alignment
- hierarchy
- icon consistency
- control sizing
- panel density
- hover states
- active states
- selected states
- transitions
- map-to-UI contrast

Target aesthetic:

"professional modern GIS tool + premium developer tool."

Think:

precise
quiet
technical
spatial
confident

Avoid:

generic SaaS
Dribbble-style decoration
excessive gradients
glassmorphism everywhere
giant rounded cards
neon overload

The interface should feel expensive because of precision, not decoration.
```

---

# 9. GOOGLE STITCH PROMPT

```text
Design a high-fidelity desktop web application called PlotLens.

PlotLens is a map-first property and land investigation workspace.

The user investigates properties and land using:

- interactive maps
- satellite imagery
- government GIS layers
- proposed road/project layers
- historical maps
- personal images
- annotations
- measurements
- source metadata

This is NOT a generic property listing application.

It is an investigation tool.

## Design direction

Create a dark, professional, map-centric interface.

The map should occupy approximately 75–85% of the screen.

The interface should feel:

precise
minimal
technical
professional
spatial
fast

Avoid generic SaaS dashboard patterns.

## Main workspace

Create:

Top navigation
Left collapsible Layers panel
Large central Map
Right compact Tools rail

Top navigation:

PlotLens
Project name
Location search
Save status
Share
Export

Left panel:

Layers

Base Map
- Satellite
- Streets

Government
- Proposed Roads
- Master Plan
- Zoning
- Parcels

My Data
- Properties
- Annotations
- Measurements

Overlays
- Historical Map
- Survey Image

Right tools:

Pin
Line
Polygon
Measure
Note
Image Overlay

## Map behavior

The map is the primary canvas.

Sidebars collapse.

When collapsed, the map occupies almost the entire screen.

Include:

zoom
compass
scale
coordinates

## Image overlay

Create a realistic interaction where an old survey image is placed over the map.

User can:

drag
scale
rotate
change opacity
lock
hide

Show approximately 40% opacity so the underlying map remains visible.

Add subtle selection handles.

## Annotation

A user can drop a pin and open a contextual panel.

Show:

name
coordinates
area
notes
photos
sources

## Measurement

Allow the user to draw a polygon and display:

12,345 m²
1.23 hectares

Use a small floating measurement label.

## Source awareness

When selecting a government layer, show:

source
dataset
publication date
last checked
license

Do not make legal ownership claims.

Differentiate official, user-created, approximate and historical information visually.

## Visual system

Background:
#0B0D0F

Surface:
#11151A

Elevated:
#171C22

Border:
#252B33

Primary text:
#F5F7FA

Secondary:
#A7AFBA

Accent:
#B8FF52

Use the accent sparingly.

Typography:
Inter or Geist.

Use compact controls and subtle borders.

Avoid excessive rounded cards.

## Prototype flow

Projects
→ New Project
→ Map
→ Layers
→ Add Overlay
→ Adjust Overlay
→ Pin
→ Polygon
→ Measure
→ Note
→ Save
→ Export

Prioritize the map workspace over every other screen.

Generate the high-fidelity UI now.
```

---

# 10. CLAUDE ARTIFACT PROMPT

```text
I want you to act as a senior product designer + GIS UX designer + frontend prototype engineer.

Build an interactive prototype of PlotLens using an Artifact.

Do not just describe the UI.

Actually create the interactive prototype.

## Product

PlotLens is a private map-first property research workspace.

The user can:

- create map projects
- search locations
- inspect maps
- toggle layers
- import historical images
- place images over the map
- change opacity
- move/rotate/scale overlays
- add pins
- draw polygons
- measure distance/area
- add notes
- attach photos
- inspect source information
- save projects
- export investigations

## UX principle

The map is the application.

DO NOT create a generic SaaS dashboard.

The main experience should be:

MAP
+
LAYERS
+
TOOLS
+
CONTEXTUAL DETAILS

## Prototype screens

Create:

1. Projects
2. New Project
3. Map Workspace
4. Layers
5. Overlay controls
6. Annotation panel
7. Measurement
8. Source details
9. Export

## Main map workspace

Use a large simulated map area.

If a real map cannot be used in the Artifact environment, create a convincing map-like canvas with:

roads
blocks
land parcels
labels
terrain/satellite-style texture

Do not use a generic gray rectangle labeled "Map".

## Layout

Top:
PlotLens
Project
Search
Save status
Export

Left:
Layers

Right:
Tools

Center:
Map

Both side panels can collapse.

## Tools

Pin
Line
Polygon
Measure
Note
Overlay

Make them interactive.

## Overlay prototype

Implement a simulated historical-map image overlay.

It must support:

drag
scale
rotation
opacity
lock
visibility

Show the overlay above the simulated map.

Add handles when selected.

## Annotation

Clicking a pin opens a contextual panel.

Example:

Candidate Property

Coordinates:
27.XXXX, 78.XXXX

Area:
12,345 m²

Notes:
Potential acquisition

Photos:
3

Sources:
Government Road Plan
Survey Map

## Measurement

Allow a simulated polygon measurement.

Show:

12,345 m²
1.23 hectares

## Layer system

Create:

Base Map
Government
My Data
Overlays

Layers support:

visibility
opacity
selection

## Visual style

Dark professional GIS application.

Palette:

#0B0D0F
#11151A
#171C22
#252B33
#F5F7FA
#A7AFBA
#B8FF52

Use Inter/Geist-style typography.

Compact controls.

Minimal decoration.

No generic SaaS cards.

## Important

The prototype must feel like a real application rather than a static mockup.

Use realistic interaction states:

hover
selected
active
disabled
loading
empty
error

Do not implement a backend.

This is a UX prototype.

After building it, critique your own design and identify:

1. confusing interactions
2. unnecessary UI
3. missing GIS controls
4. accessibility issues
5. mobile problems
6. workflows that require too many clicks

Then improve the prototype based on your critique.
```

---

# 11. CLAUDE — HOSTILE UX REVIEW

```text
Now stop adding features.

Act as a hostile senior UX reviewer.

Review the PlotLens prototype as if you were evaluating it before development.

Analyze:

## 1. First-time user experience

Can someone understand what PlotLens does within 30 seconds?

## 2. Map workflow

Can the user quickly:

- search
- navigate
- toggle layers
- add a pin
- draw an area
- measure
- add a note

?

## 3. Image overlay workflow

Is it obvious how to:

- upload
- move
- rotate
- scale
- change opacity
- lock

an image?

## 4. Information density

Is the UI too crowded?

Are panels stealing too much map space?

## 5. GIS usability

Are important map controls missing?

## 6. Property research

Does the interface actually help someone investigate a property?

## 7. Trust

Does the UI accidentally make approximate/user-created information look official?

## 8. Accessibility

Check:

keyboard
contrast
focus
icon labels
touch targets
motion

## 9. Mobile

What breaks on a phone?

## 10. Cognitive load

Identify every unnecessary decision the user must make.

For each issue provide:

Problem
Severity
Why it matters
Recommended fix

Do NOT implement the fixes yet.

First give me the critique.
```

---

# 12. CLAUDE — APPLY UX FIXES

```text
Apply only the UX fixes that you identified as HIGH priority.

Do not add new features.

Do not redesign the entire application.

Preserve the current PlotLens visual identity.

Prioritize:

1. Map usability
2. Image overlay usability
3. Layer clarity
4. Annotation workflow
5. Measurement workflow
6. Source clarity
7. Accessibility

For every change, preserve existing functionality.

After making the changes, provide a short list of what changed and why.
```

---

# 13. DO NOT LET ALL AI TOOLS CREATE THE FINAL DESIGN

Do not do:

```text
Figma → final
Stitch → final
Claude → final
```

and randomly select whichever looks prettiest.

Instead:

```text
Project Documents
      ↓
Figma Make
      ↓
Primary UX
      ↓
Google Stitch
      ↓
Alternative ideas
      ↓
Human review
      ↓
Claude UX critique
      ↓
UX fixes
      ↓
Final Figma design
      ↓
Design system
      ↓
Coding AI
```

---

# 14. WHAT EACH AI MUST NOT DO

## Figma Make

Do not allow it to:

- invent unrelated features
- redesign information architecture without approval
- turn PlotLens into a dashboard
- add unnecessary analytics
- hide the map
- add excessive decoration

## Google Stitch

Do not allow it to:

- become the source of truth automatically
- introduce unrelated product concepts
- optimize only for visual appearance

Use it for alternative design exploration.

## Claude

Do not allow it to:

- endlessly add features
- over-engineer the MVP
- replace the map with UI
- treat every UX problem as a new feature
- implement fixes before identifying the problem

## Coding AI

Do not allow it to:

- invent a new design
- replace the approved component system
- arbitrarily change colors
- change UX without documentation
- remove accessibility
- simplify away important GIS behavior

---

# 15. APPROVED DESIGN → CODING AI HANDOFF

Once Figma is approved, provide the coding AI:

```text
PlotLens_Project_Specification.md
PlotLens_PreDevelopment_Readiness_Checklist.md
PlotLens_Security_Privacy_Compliance_Checklist.md
PlotLens_UI_UX_Design_Workflow.md

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

Also provide:

```text
Figma design reference
Approved screenshots
Prototype
Design tokens
Component definitions
```

---

# 16. CODING AI UI RULES

Add these to `AGENTS.md` or the project's coding-agent instructions.

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
12. Do not change interaction behavior without updating UX documentation.
13. Do not replace a Figma-approved design with an unrelated implementation.
14. Any major UX change requires review before implementation.
15. Do not remove source/provenance information from external data.
16. Do not make user-created boundaries visually appear to be official legal boundaries.
17. Preserve privacy and sharing behavior defined by the security/compliance documentation.
```

---

# 17. FINAL DESIGN APPROVAL CHECKLIST

Before development:

```text
[ ] Product design brief approved
[ ] UX research completed
[ ] Information architecture approved
[ ] User flows approved
[ ] Wireframes reviewed
[ ] High-fidelity map workspace approved
[ ] Image-overlay workflow approved
[ ] Layer system approved
[ ] Annotation workflow approved
[ ] Measurement workflow approved
[ ] Source/provenance UX approved
[ ] Mobile strategy approved
[ ] Design tokens defined
[ ] Components defined
[ ] Accessibility reviewed
[ ] Interactive prototype tested
[ ] UX critique completed
[ ] High-priority UX issues fixed
[ ] Security/compliance UX review completed
[ ] Figma handoff prepared
```

---

# 18. MVP UX ACCEPTANCE TEST

The design is ready for development only when a new user can perform this task without a tutorial:

```text
Create project
      ↓
Search location
      ↓
Navigate map
      ↓
Enable government/project layer
      ↓
Upload historical image
      ↓
Place image over current map
      ↓
Reduce opacity
      ↓
Move / rotate / scale image
      ↓
Drop property pin
      ↓
Draw candidate property area
      ↓
Measure area
      ↓
Add note
      ↓
Inspect source
      ↓
Save
      ↓
Reopen
      ↓
Export
```

If the user gets confused, redesign the workflow before coding.

---

# 19. RECOMMENDED TOOLCHAIN

```text
Product research
        ↓
Project documentation
        ↓
Figma
        ↓
Figma Make
        ↓
Interactive UX prototype
        ↓
Google Stitch
        ↓
Alternative visual exploration
        ↓
Claude
        ↓
UX critique + refinement
        ↓
Final approved design
        ↓
Design system
        ↓
Claude Code / Cursor / Copilot
        ↓
React + TypeScript
        ↓
Map engine
        ↓
GIS libraries
        ↓
Firebase / backend
        ↓
Testing
        ↓
Visual QA
```

---

# 20. FINAL DESIGN PRINCIPLE

PlotLens should always be designed in this order:

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

Never:

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

The UI exists to make that investigation:

- fast
- understandable
- precise
- trustworthy
- accessible
- enjoyable

---

# 21. SHORT OPERATIONAL VERSION

When starting a new AI design session:

```text
1. Attach the PlotLens project documents.
2. Send the MASTER DESIGN CONTEXT PROMPT.
3. Send the Figma Make master prompt.
4. Generate the first prototype.
5. Manually inspect the map workspace.
6. Refine map workspace.
7. Refine image overlay.
8. Refine layers.
9. Test the complete investigation journey.
10. Use Google Stitch for an alternative design direction.
11. Compare alternatives.
12. Choose the strongest UX direction.
13. Give the result to Claude.
14. Ask Claude for a hostile UX review.
15. Fix only high-priority issues.
16. Finalize Figma design.
17. Create design-system documentation.
18. Give approved design + docs to coding AI.
19. Implement incrementally.
20. Perform visual QA against Figma.
```

---

# 22. MOST IMPORTANT INSTRUCTION TO EVERY AI

```text
DO NOT OPTIMIZE FOR HOW MUCH UI YOU CAN GENERATE.

OPTIMIZE FOR HOW EASILY A USER CAN INVESTIGATE A PROPERTY ON A MAP.
```
