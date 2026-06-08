/**
 * Reference catalog of plant & equipment commonly hired out in South Africa,
 * grouped into categories so the picker stays tidy instead of one long list.
 * These are suggestions only — line items can always be typed free-hand.
 */

export interface MachineryCategory {
  id: string;
  label: string;
  items: string[];
}

export const MACHINERY_CATALOG: MachineryCategory[] = [
  {
    id: "earthmoving",
    label: "Earthmoving / Yellow plant",
    items: [
      "Excavator 20T",
      "Excavator 30T",
      "Mini excavator",
      "TLB (Tractor-Loader-Backhoe)",
      "Front end loader",
      "Bulldozer",
      "Grader",
      "Articulated dump truck (ADT)",
      "Skid steer (Bobcat)",
    ],
  },
  {
    id: "trucks",
    label: "Trucks & haulage",
    items: [
      "Tipper truck (10m³)",
      "Dump truck",
      "Water truck / bowser",
      "Lowbed",
      "Flatbed truck",
      "Crane truck (HIAB)",
      "Concrete mixer truck",
      "Hooklift truck",
    ],
  },
  {
    id: "compaction",
    label: "Compaction",
    items: [
      "Smooth drum roller",
      "Padfoot roller",
      "Pedestrian roller",
      "Plate compactor",
      "Rammer (jumping jack)",
    ],
  },
  {
    id: "concrete",
    label: "Concrete & masonry",
    items: [
      "Concrete mixer",
      "Concrete pump",
      "Poker vibrator",
      "Power float",
      "Bar bender / cutter",
    ],
  },
  {
    id: "lifting",
    label: "Lifting & access",
    items: [
      "Mobile crane",
      "Telehandler",
      "Forklift",
      "Cherry picker / boom lift",
      "Scissor lift",
    ],
  },
  {
    id: "roads",
    label: "Roads & surfacing",
    items: [
      "Asphalt paver",
      "Bitumen sprayer",
      "Road marking machine",
      "Chip spreader",
      "Tar boiler",
    ],
  },
  {
    id: "site",
    label: "Site & general",
    items: [
      "Generator",
      "Air compressor",
      "Tower light",
      "Water pump",
      "Brush cutter",
      "Mobile toilet",
      "Site container / office",
    ],
  },
];
