import { DiyGuide } from '@/types';

export const diyGuides: DiyGuide[] = [
  {
    id: '1',
    title: 'Mk1 GTI Carburetor Rebuild Guide',
    slug: 'mk1-gti-carburetor-rebuild',
    generation: 'mk1',
    system: 'engine',
    author: 'VW Master Tech',
    content: `# Mk1 GTI Carburetor Rebuild

This guide covers the complete rebuild of the original GTI 8V carburetor.

## Tools Needed
- Carburetor rebuild kit
- Screwdriver set
- Small wrenches
- Carburetor cleaner
- Compressed air

## Difficulty: Moderate
- Time Estimate: 2-3 hours

## Steps

### 1. Remove the Carburetor
1. Disconnect battery negative terminal
2. Remove air filter housing
3. Disconnect fuel lines
4. Disconnect throttle cable
5. Remove mounting bolts

### 2. Disassemble
1. Remove Float chamber
2. Remove float
3. Remove accelerator pump
4. Remove jets and needles

### 3. Clean Thoroughly
Use carburetor cleaner on all passages. Blow out with compressed air.

### 4. Install Rebuild Kit
Replace all gaskets, needles, and seals from the kit.

### 5. Reassemble
Reverse the removal steps. Set float level to spec.

### 6. Initial Start
Allow to idle for 5 minutes. Check for leaks.
Adjust mixture as needed.`,
    difficulty: 'moderate',
    timeEstimate: '2-3 hours',
    tools: ['Carburetor rebuild kit', 'Screwdriver set', 'Wrench set', 'Carburetor cleaner', 'Compressed air'],
    parts: ['Carburetor rebuild kit', 'Float', 'Accelerator pump'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    views: 1250,
    featured: true,
  },
  {
    id: '2',
    title: 'Mk4 GTI 1.8T Turbo Replacement',
    slug: 'mk4-gti-18t-turbo-replacement',
    generation: 'mk4',
    system: 'engine',
    author: 'Turbo Dave',
    content: `# Mk4 GTI 1.8T Turbo Replacement

Complete guide to replacing the K04 turbo on your Mk4 GTI.

## Tools Needed
- Socket set
- Torque wrench
- Heat gun
- Penetrating oil
- New turbo gaskets

## Difficulty: Hard
- Time Estimate: 6-8 hours

## Steps

### 1. Preparation
1. Disconnect battery
2. Support engine from above
3. Remove intercooler pipes
4. Remove catalytic converter

### 2. Remove Old Turbo
1. Remove oil feed line
2. Remove oil drain line
3. Remove exhaust manifold nuts
4. Remove turbo bolts
5. Lower turbo assembly

### 3. Install New Turbo
1. Clean mating surfaces
2. Install new gaskets
3. Mount new turbo
4. Reconnect oil lines
5. Reconnect intercooler

### 4. Fill Oil System
Before starting, prime the turbo with oil.

### 5. Initial Run
Let idle for 2 minutes. Check for leaks.
`,
    difficulty: 'hard',
    timeEstimate: '6-8 hours',
    tools: ['Socket set', 'Torque wrench', 'Heat gun', 'Penetrating oil', 'New turbo gaskets'],
    parts: ['K04 Turbocharger', 'Turbo gaskets', 'Oil feed line gasket', 'Mounting bolts'],
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z',
    views: 2340,
    featured: true,
  },
  {
    id: '3',
    title: 'Mk1 Golf Suspension Lowering',
    slug: 'mk1-golf-suspension-lowering',
    generation: 'mk1',
    system: 'suspension',
    author: 'Bagged VW',
    content: `# Mk1 Golf Suspension Lowering Guide

How to lower your Mk1 Golf for that经典 hot hatch look.

## Options
- Spring spacer (1 inch)
- Cut springs (1.5-2 inches)
- H&R lowering springs (2 inches)
- Coilovers (2-3 inches)

## Difficulty: Easy
- Time Estimate: 2-4 hours

## Steps

### 1. Front
1. Loosen lug nuts while on ground
2. Jack up front
3. Remove wheels
4. Remove struts
5. Install lowering springs or adjust coils
6. Reassemble

### 2. Rear
1. Jack up rear
2. Support with jack stands
3. Remove rear shocks
4. Install lowering springs
5. Reassemble

### 3. Alignment
- Get alignment checked after lowering
- Camber will be more negative
- May need camber plates up front`,
    difficulty: 'easy',
    timeEstimate: '2-4 hours',
    tools: ['Jack', 'Jack stands', 'Socket set', 'Torque wrench', 'Spring compressor'],
    parts: ['Lowering springs', 'Strut mounts', 'Bump stops'],
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z',
    views: 3450,
    featured: true,
  },
  {
    id: '4',
    title: 'Type 1 Beetle Floor Pan Replacement',
    slug: 'type1-beetle-floor-pan-replacement',
    generation: 'type1',
    system: 'body',
    author: 'Air Cooled Restorations',
    content: `# Type 1 Beetle Floor Pan Replacement

Complete guide to replacing rusted floor pans on your Beetle.

## Tools Needed
- Welder
- Drill
- Grinding wheel
- Sheet metal
- Clamps
- Rust converter

## Difficulty: Hard
- Time Estimate: 20-30 hours

## Steps

### 1. Remove Interior
1. Remove all seats
2. Remove carpet
3. Remove heater channels
4. Disconnect wiring

### 2. Cut Out Rust
1. Drill spot welds
2. Cut with cutoff wheel
3. Grind surfaces clean
4. Apply rust converter

### 3. Install New Floor Pan
1. Fit and clamp new pan
2. Plug weld in place
3. Ground all seams
4. Seal with primer

### 4. Reinstall
Reverse removal steps.

### 5. Finish
- Undercoat
- POR-15
- Topside primer`,
    difficulty: 'hard',
    timeEstimate: '20-30 hours',
    tools: ['MIG welder', 'Drill', 'Grinding wheel', 'Sheet metal', 'Clamps'],
    parts: ['Floor pan (driver)', 'Floor pan (passenger)', 'Tunnel', 'Battery tray'],
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z',
    views: 890,
    featured: false,
  },
  {
    id: '5',
    title: 'Mk2 GTI Brake Upgrade',
    slug: 'mk2-gti-brake-upgrade',
    generation: 'mk2',
    system: 'brakes',
    author: 'Stop Tech',
    content: `# Mk2 GTI Brake Upgrade

Guide to upgrading your Mk2 brakes from stock to big brake kit.

## Options
- Stage 1: 288mm front rotor + performance pads
- Stage 2: 4-pot caliper conversion
- Stage 3: Complete BBK

## Difficulty: Moderate
- Time Estimate: 4-6 hours

## Stage 1: Rotor and Pads
1. Jack up car
2. Remove wheels
3. Remove caliper bolts
4. Remove old rotor
5. Install new rotor
6. Install performance pads
7. Bleed system

## Stage 2: Big Brake Kit
1. Remove stock caliper
2. Install brake caliper bracket
3. Install 4-pot caliper
4. Install new lines
5. Bleed thoroughly

## Tips
- Use braided stainless lines
- Bed in pads properly
- Use DOT 4 fluid`,
    difficulty: 'moderate',
    timeEstimate: '4-6 hours',
    tools: ['Jack', 'Jack stands', 'Socket set', 'Torque wrench', 'Flare tool'],
    parts: ['288mm rotor', 'Performance pads', 'Brake lines', 'Caliper bracket'],
    createdAt: '2024-04-01T10:00:00Z',
    updatedAt: '2024-04-01T10:00:00Z',
    views: 1560,
    featured: false,
  },
  {
    id: '6',
    title: 'Mk3 VR6 Timing Belt Replacement',
    slug: 'mk3-vr6-timing-belt',
    generation: 'mk3',
    system: 'engine',
    author: 'VR6 Ranger',
    content: `# Mk3 VR6 Timing Belt Replacement

Critical maintenance for your VR6 engine - timing belt every 60k miles.

## ⚠️ WARNING
If timing belt breaks, your VR6 will have catastrophic engine damage.

## Tools Needed
- Timing belt tool
- Socket set
- Torque wrench
- New timing belt kit

## Difficulty: Moderate
- Time Estimate: 4-6 hours

## Steps

### 1. Remove Covers
1. Disconnect battery
2. Remove engine cover
3. Remove timing belt covers

### 2. Set TDC
Verify cylinder 1 at TDC on compression stroke.

### 3. Loosen Belt
Loosen tensioner. Remove old belt.

### 4. Install New Belt
Follow marks on cam gears. Ensure proper routing.

### 5. Tension
Use tool to set proper tension.

### 6. Double Check
Rotate engine 2 complete turns.
Verify timing marks align.

### 7. Reassemble
Replace all covers. Reconnect battery.

## After Installation
Start engine. Listen for unusual sounds.
Check idle smooth.`,
    difficulty: 'moderate',
    timeEstimate: '4-6 hours',
    tools: ['Timing belt tool', 'Socket set', 'Torque wrench', 'Breaker bar'],
    parts: ['Timing belt kit', 'Water pump', 'Tensioner', 'Idler pulleys'],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    views: 4200,
    featured: true,
  },
];

export default diyGuides;