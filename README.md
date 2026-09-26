# One Wall Kitchen

# Build: One Wall Kitchen

Build a polished, functional MVP web application called **One Wall Kitchen**.

The application lets a user design a **2D, one-wall kitchen from scratch** using drag-and-drop components, precise dimensions, snapping/alignment, grouping, and simple styling. It should feel like a genuinely usable lightweight kitchen-design tool—not a generic SaaS dashboard or a static mockup.

The primary goal is to demonstrate strong product thinking, thoughtful UX, visual refinement, and the ability to turn a concise product concept into a working product.

## 1. Core Product Experience

The primary workflow is:

**Create design → choose wall dimensions/template → add components → position/resize/style components → organize and align → name/save → export**

The application should support:

1. Start with a blank canvas OR choose a template.

2. Choose wall dimensions.

3. Add kitchen components.

4. Edit component dimensions.

5. Edit component style.

6. Edit hardware where applicable.

7. Move components by dragging.

8. Group components.

9. Align components.

10. Toggle grid visibility.

11. Optionally enable snapping.

12. Name the design.

13. Save the design locally.

14. Export the design.

15. Import a previously exported design file.

The experience should be intuitive enough that a first-time user can understand the basic workflow without reading instructions.

---

# 2. Visual Design Direction

The visual design is extremely important.

The aesthetic should be:

- Minimal

- Elegant

- Refined

- Architectural

- Sophisticated

- Calm

- Functional

- Slightly editorial/design-studio inspired

Do NOT make this look like a colorful consumer SaaS product, a generic AI app, or a dense CAD application.

### Canvas

The kitchen design itself should be **primarily black and white**, with gray and very restrained light earth tones used only when useful for contrast or hierarchy.

The primary canvas should feel like a clean architectural drawing.

Outside the canvas, use a **muted medium gray background**.

Provide an optional appearance/settings side panel that is hidden by default and can slide/pop out when requested. This panel should allow the user to choose among several muted earth-tone background options.

Keep these colors restrained and sophisticated—not saturated.

### Typography

Use exactly two primary fonts:

- **Cormorant Garamond** — display/brand typography

- **Inter** — functional/UI typography

The application title **"One Wall Kitchen"** should appear prominently in the **top-left corner**.

It should be substantially larger than ordinary application navigation text, but not so large that it dominates the interface.

Use Cormorant Garamond for the title to create a sophisticated architectural/editorial feeling.

Use Inter for controls, labels, dimensions, menus, buttons, tooltips, and other functional UI.

Typography should have generous spacing and hierarchy. Avoid excessive bolding.

### General UI

Use:

- generous whitespace

- subtle borders

- restrained shadows

- simple icons

- understated controls

- clean alignment

- minimal visual noise

Avoid:

- gradients

- excessive rounded cards

- excessive pills

- bright accent colors

- unnecessary animations

- dashboard-style widgets

- cluttered toolbars

The application should feel like something produced by a thoughtful design studio.

---

# 3. Overall Layout

Use a desktop-first application layout.

Suggested structure:

### Top area

Left:

**One Wall Kitchen**

Center/right:

Design name and key controls such as Save, Import, Export.

### Main workspace

A large central design canvas.

### Component library

A compact, easily accessible component library/panel containing categories:

- Cabinets & Shelving

- Countertops

- Appliances

- Windows & Doors

- Decor

The library should not overwhelm the canvas.

### Contextual editing

When a component is selected, expose its relevant properties in a contextual panel or toolbar.

Properties may include:

- Width

- Height

- Depth where relevant

- Position

- Style

- Hardware where applicable

Use feet/inches naturally:

- Wall dimensions should primarily use feet/inches.

- Components should use inches for detailed dimensions.

- Where useful and where it doesn't clutter the interface, show the corresponding feet/inches measurement on hover or parenthetically.

For example:

`36 in (3 ft)`

Use good judgment about when secondary measurements are useful.

---

# 4. Wall / Canvas Setup

When creating a new design, allow the user to select:

### Height

Default options:

- 6.5 ft

- 8 ft

- 9 ft

### Width

Default options:

- Small — 7 ft

- Medium — 10 ft

- Large — 14 ft

Also provide a custom dimension option.

The canvas should visually scale appropriately while maintaining accurate internal dimensions.

The actual design coordinate system should use real-world measurements rather than arbitrary screen pixels.

---

# 5. Templates

Provide several useful starter templates in addition to a blank canvas.

At minimum include approximately 3–5 templates.

Templates should demonstrate different sensible arrangements of the available components, such as:

- Compact kitchen

- Standard kitchen

- Appliance-forward kitchen

- Storage-forward kitchen

- Balanced kitchen

Templates should be immediately editable after selection.

Do not over-invest in template complexity.

---

# 6. Component Library

Implement a useful medium-sized initial library.

### Cabinets & Shelving

Include examples such as:

- Base cabinet

- Upper cabinet

- Tall cabinet/pantry

- Drawer cabinet

- Open shelving

### Countertops

Include:

- Standard countertop

- Countertop section that can resize with the cabinetry

### Appliances

Include:

- Refrigerator

- Range

- Dishwasher

- Microwave

- Range hood

- Oven

### Windows & Doors

Include:

- Window

- Door/opening

### Decor

Include a small selection such as:

- Sink

- Pendant/light

- Plant

- Small decorative object

- Stool or similar simple object

Prioritize useful components over having a huge catalog.

---

# 7. Component Behavior

Components should be actual interactive objects—not static images.

Users should be able to:

- Click/select

- Drag

- Resize

- Duplicate where appropriate

- Delete

- Group

- Ungroup

- Align

- Reposition

Components should have sensible minimum and maximum dimensions.

Do not allow obviously nonsensical dimensions.

For example, a refrigerator should not be freely resizable to a 2-inch width.

Use realistic dimension constraints appropriate to each component type.

### Selection

Selected components should have a subtle but obvious selection state.

Provide resize handles where appropriate.

Show dimensions in a clean, unobtrusive manner.

### Dragging

Dragging should feel smooth.

When snapping is enabled, components should intelligently snap to:

- wall boundaries

- other components

- meaningful edges

- alignment points

- grid increments

Snapping should be optional.

---

# 8. Grid and Measurement

Provide a grid toggle.

The grid should be subtle and never overpower the kitchen design.

Allow snapping to be independently enabled/disabled.

Where useful, show temporary measurement guides while moving or resizing components.

The application should communicate spatial relationships clearly without becoming visually cluttered.

---

# 9. Grouping and Alignment

Support selecting multiple components and:

- Group

- Ungroup

- Align left

- Align center

- Align right

- Align top/bottom where meaningful

- Distribute evenly where practical

Make these controls contextual so they don't clutter the main interface when they aren't relevant.

---

# 10. Component Styling

Every applicable component should have a small set of stylistic options.

Examples:

### Cabinets

- door style

- finish

- basic color/material

### Hardware

Where applicable:

- knob

- pull

- handle style

### Countertops

- basic material

- restrained color/material options

### Appliances

- black

- white

- stainless/metallic

Keep the initial style library intentionally small and refined.

The default design should remain black and white.

Do not turn the core editor into a color picker-heavy experience.

---

# 11. Save / Persistence

Do NOT require user authentication.

Use browser/local persistence for the current design.

The user should be able to save a design and return to it in the same browser.

Clearly distinguish:

**Save**

from

**Export**

Save means persist the current editable design locally.

Export means create a portable file/output.

---

# 12. Import / Export

Support three export formats:

### PNG — Showcase

Export a clean image of the completed 2D kitchen design.

### PDF — Print

Export a clean printable design sheet containing:

- kitchen design

- wall dimensions

- relevant component dimensions

- design name

### JSON — Design File

Export the complete structured design state as a JSON file.

The JSON should contain enough information to reconstruct the editable design, including:

- design metadata

- wall dimensions

- component types

- component positions

- component dimensions

- component styling

- hardware selections

- groups

- grid/snap settings

Allow the user to import a previously exported JSON design file and continue editing it.

Treat JSON as the canonical editable design format.

---

# 13. AI Features

Build the application architecture so AI features are represented as first-class product functionality, but do not allow missing AI credentials/API access to prevent the core application from working.

The initial MVP should include polished AI feature entry points and functional flows where feasible.

## AI 3D View

Provide an action such as:

**"Create 3D View"**

The intended experience is that the application takes the current 2D design and produces a conceptual 3D visualization.

For the MVP, a generated/conceptual 3D image is sufficient; an actual interactive 3D CAD model is NOT required.

If a real image-generation API is not configured, provide a graceful demonstration/fallback experience rather than breaking the application.

Clearly distinguish generated visualization from the authoritative 2D design.

---

# 14. AI Design / Color Suggestions

Provide an AI design assistant experience.

Users should be able to request suggestions such as:

- Suggest a color palette

- Suggest materials

- Suggest a kitchen style

- Apply a suggested palette

- Create a visualization using the selected palette

Example style directions:

- Warm Minimal

- Scandinavian

- Modern Traditional

- Natural

- Contemporary

Keep these suggestions sophisticated and restrained.

AI should enhance the user's design rather than completely replacing it.

---

# 15. Materials List

Provide a **Materials** view that analyzes the current design and produces an estimated materials list.

Examples:

- Base cabinets

- Upper cabinets

- Tall cabinets

- Countertop

- Sink

- Appliances

- Hardware

- Shelving

- Backsplash

Show quantities where possible.

The list should update based on the actual components in the design.

---

# 16. Cost Estimates

Provide:

### Material Cost Estimate

Calculate a reasonable estimated material cost using a built-in catalog of realistic generic prices.

This does NOT need live retailer pricing.

Clearly label estimates as estimates.

### Labor Cost Estimate

Provide a reasonable estimated labor range based on the components/design.

Clearly label this as an estimate rather than an authoritative quote.

Show enough detail that the user can understand what is driving the estimate.

---

# 17. Buying Guide

Provide a buying guide based on the current design.

Organize recommendations into categories such as:

- Cabinets

- Countertops

- Appliances

- Hardware

- Fixtures

- Miscellaneous materials

For the MVP, use generic product categories/representative recommendations rather than requiring live retailer integrations.

The experience should feel useful without pretending to provide real-time purchasing data.

---

# 18. AI Assistant UX

Include a contextual AI area/panel that can expose actions such as:

- Suggest a design

- Suggest colors/materials

- Create 3D view

- Generate materials list

- Estimate costs

- Create buying guide

A lightweight conversational interface may be included if it improves the experience, but do not allow a chatbot to dominate the application.

**The product is fundamentally a kitchen design tool, not a chatbot.**

---

# 19. Error Handling / Empty States

Make all major states polished.

Examples:

- Blank canvas

- No component selected

- No saved design

- Empty materials list

- AI feature unavailable

- Invalid imported JSON

- Export in progress

- AI generation in progress

Use graceful loading states and clear messaging.

Never expose raw technical errors to the user.

---

# 20. Responsive Behavior

Optimize primarily for desktop/laptop screens because precise kitchen design is the core use case.

The interface should still degrade gracefully on smaller screens.

Do not sacrifice the desktop canvas experience in pursuit of aggressive mobile responsiveness.

---

# 21. Product Quality Bar

This should feel like a **real, coherent MVP**, not a collection of disconnected demos.

Prioritize:

1. Excellent 2D editing experience

2. Visual polish

3. Accurate dimensions

4. Smooth drag/drop behavior

5. Clear component hierarchy

6. Save/import/export

7. AI feature integration

8. Materials/cost functionality

If a requested feature creates disproportionate implementation complexity, preserve the user experience and make a sensible lightweight implementation rather than building an elaborate backend.

Do not add unrelated features.

Do not add authentication, payments, social features, collaboration, accounts, or an elaborate backend.

---

# 22. Important Product Principle

The application should demonstrate that the product designer understands the difference between **the user's problem and the implementation**.

Do not build unnecessary technical complexity merely because it is possible.

The user wants to answer:

> "What can I fit on this wall, what will it look like, what will I need, and roughly what will it cost?"

Every major feature should support that outcome.

---

# 23. Final UX Flow

A new user should be able to:

1. Open One Wall Kitchen.

2. Click **New Design**.

3. Choose Blank Canvas or Template.

4. Choose a wall size.

5. Enter the editor.

6. Drag components onto the wall.

7. Resize and reposition them.

8. See useful dimensions.

9. Turn grid/snapping on or off.

10. Group and align components.

11. Style components.

12. Name the design.

13. Save it.

14. Generate a materials list.

15. View estimated material/labor costs.

16. Request AI design/color suggestions.

17. Generate a conceptual 3D visualization.

18. Export PNG, PDF, or JSON.

19. Import the JSON later and continue editing.

Make this workflow feel exceptionally coherent and polished.

---

# 24. Implementation Guidance

Choose a modern, maintainable web architecture appropriate for a client-side interactive design application.

Prefer simple architecture over unnecessary infrastructure.

The design state should be represented as structured data so that:

- undo/redo can be supported

- save/load is straightforward

- JSON export/import is reliable

- future AI features can consume the design state

- future 3D rendering could consume the same underlying model

Use reusable components and keep the data model clean.

Before finishing, test the primary user journey end-to-end.

Pay particular attention to:

- drag/drop

- resizing

- snapping

- selection

- grouping

- alignment

- save/load

- JSON import/export

- PNG export

- PDF export

- materials calculations

- cost calculations

The finished application should look polished enough to be shown directly to a product manager/recruiter as a portfolio project.

**Build the complete MVP now. Make reasonable implementation decisions without stopping to ask me questions.**

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://one-wall-kitchen.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8e55adc7-cd08-4a4a-b1e7-73a2d90a56e2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
