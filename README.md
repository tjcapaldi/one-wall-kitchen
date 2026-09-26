# One Wall Kitchen

A simple 2D kitchen planner for designing a one-wall kitchen without the complexity of professional kitchen-design software.

**[→ Open the live app](https://one-wall-kitchen.lovable.app/)**

## Why I built it

I’m planning a future kitchen remodel and found that most kitchen-design tools are built for professional designers and are unnecessarily complex for a homeowner who primarily wants to answer:

> **What can I fit on this wall, what will it look like, and what will I need?**

One Wall Kitchen is a lightweight alternative focused on that core problem.

## How it works

The product is organized around three simple steps:

**Design → Visualize → Plan**

* **Design:** Build a to-scale 2D kitchen layout using real-world dimensions. 
    * Drag, resize, position, group, and align cabinets, appliances, countertops, and other components. 
    * Use templates, grids, snapping, and component styling to refine the design.
* **Visualize:** Turn the 2D design into a visual representation of the finished kitchen.
    * Select color palettes and materials. 3D rendering planned but not yet implemented.
* **Plan:** Review the practical details behind the design, including the components, materials, quantities, and estimated costs needed to bring it to life.
    * Itemized materials list, labor cost estimate for install, and a buying guide.

Designs can be saved locally and exported as **PNG, PDF, or JSON**, with JSON preserving the editable design data for future use.

## What's next

* **AI visualization:** Generate a realistic image of the kitchen from the 2D design
* **Planning exports:** Export the planning information from the Plan view for use during the remodel
* **Countertop management:** Simplify the adding and resizing user experience for countertops.

## Tech

Built as a client-side web application with **React, TypeScript, and Tailwind CSS**, with **Lovable** used to accelerate development and iteration.

## Status

This is a portfolio project built around a real personal problem. The code is open for others to explore and build from, with the possibility of commercializing the product in the future.

## Run locally

```bash
npm install
npm run dev
```
