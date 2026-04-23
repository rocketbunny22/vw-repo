import { Generation } from '@/types';

export const generations: Generation[] = [
  {
    id: 'mk1',
    name: 'Mk1',
    slug: 'mk1',
    years: '1974-1983',
    description: 'The first generation of modern VW Golf/hot hatchbacks. Introduced the transverse engine layout that would define decades of VW performance.',
    models: ['Golf GTI', 'Golf Diesel', 'Rabbit'],
    image: '/images/mk1.jpg',
    systems: [
      {
        id: 'engine',
        name: 'Engine',
        slug: 'engine',
        description: 'The Mk1 GTI featured the iconic EA827 engine, later evolved into the powerful 16V and Rallye engines.',
        content: '# Engine Systems\n\nThe Mk1 Golf GTI introduced Volkswagen to the hot hatchback revolution. The original 1.6L 8V inline-four produced 110 HP, but the true legend came with later variants.\n\n## Engine Variants\n\n### 1.6L 8V (EV)\n- 110 HP @ 6,100 RPM\n- 98 lb-ft @ 3,200 RPM\n- Carbureted (最早版本)\n\n### 1.8L 8V (KR/PL)\n- 112 HP @ 5,800 RPM\n- Induction kit from factory\n- 8v Konig smallport head\n\n### 1.8L 16V (KR)\n- 139 HP @ 6,100 RPM\n- 118 lb-ft @ 4,500 RPM\n- The legendary 16V upgrade\n\n### 2.0L 16V Rallye (PG)\n- 180 HP (rally spec)\n- Not available in US\n- Ultimate Mk1 power plant',
        specs: {
          'Displacement': '1272cc - 1781cc',
          'Configuration': 'Inline 4, Transverse',
          'Valve Train': 'SOHC (8V) / DOHC (16V)',
          'Fuel System': 'Carburetor / CIS Injection',
          'Oil Capacity': '4.5 quarts w/ filter'
        },
        commonIssues: [
          'Head gasket failure on modified cars',
          'Cam belt interval neglect',
          'Smallport head oiling issues at high RPM',
          'Carburetor flooding'
        ],
        maintenanceTips: [
          'Replace cam belt every 3 years/30k miles',
          'Use 10W-40 conventional oil',
          'Check cam lobes for wear every 50k miles'
        ]
      },
      {
        id: 'suspension',
        name: 'Suspension',
        slug: 'suspension',
        description: 'The McPherson front / twist beam rear setup provided the perfect balance for aggressive handling.',
        content: '# Suspension Systems\n\n## Front Suspension\n\nThe Mk1 uses McPherson struts with lower control arms. This simple, robust design allowed for easy lowering and aggressive camber tuning.\n\n### Components\n- Strut assembly\n- Lower control arm (A-arm)\n- Sway bar links\n- Steering knuckle\n\n## Rear Suspension\n\nTwist beam rear axle provides good roll control while maintaining reasonable ride quality.\n\n### Components\n- Spring perch\n- Shock absorber\n- Trailing arm\n- Panhard rod\n- Sway bar',
        specs: {
          'Front Track': '1465mm',
          'Rear Track': '1455mm',
          'Wheelbase': '2400mm',
          'Ground Clearance': '150mm (stock)'
        },
        commonIssues: [
          'Worn tie rod ends',
          'Bushed control arms',
          'Collapsed rear springs',
          'Bad strut mounts'
        ],
        maintenanceTips: [
          'Poly bushings for improved feel',
          'Lowering can stress ball joints',
          'Check strut boot regularly'
        ]
      },
      {
        id: 'brakes',
        name: 'Brakes',
        slug: 'brakes',
        description: 'Disc brakes all around from factory, with various upgrade paths available.',
        content: '# Brake Systems\n\n## Stock Brakes\n\n### Front\n- 256mm vented disc\n- Single piston floating caliper\n\n### Rear\n- 227mm solid disc\n- Single piston caliper\n\n## Upgrades\n\n### Big Brake Kits\n- 288mm Golf G60 disc\n- 4-pot caliper upgrade\n- braided stainless lines',
        specs: {
          'Front Rotor': '256mm vented',
          'Rear Rotor': '227mm solid',
          'Master Cylinder': '22.2mm'
        },
        commonIssues: [
          'Sticking caliper pistons',
          'Warped rotors from hard track use',
          'Brake proportioning valve failure'
        ],
        maintenanceTips: [
          'Bleed with synthetic fluid',
          'Replace pads before backing plate',
          'Check rubber lines for cracks'
        ]
      },
      {
        id: 'electrical',
        name: 'Electrical',
        slug: 'electrical',
        description: 'Simple relay-based electrical system, highly reliable when maintained.',
        content: '# Electrical Systems\n\n## Charging System\n\n### Alternator\n- 55A or 70A options\n- External regulator\n- 0.8-1.0 charge voltage\n\n## Starting\n\n### Starter Motor\n- Pre-engaged type\n- 12V system\n- solenoid mounted on casing\n\n## Lighting\n\n- Quartz halogen headlights\n- Simple relay control\n- Add-on driving lights common\n\n## Instrument Cluster\n\n- Analog gauges\n- Check engine light (later models)\n- Simple sender units',
        specs: {
          'System Voltage': '12V negative ground',
          'Battery': '45-55AH',
          'Alternator': '55A / 70A'
        },
        commonIssues: [
          'Alternator bearing failure',
          'Failing voltage regulator',
          'Corroded ground points',
          'Frayed wiring harness'
        ],
        maintenanceTips: [
          'Clean battery terminals regularly',
          'Check alternator output at idle',
          'Inspect main ground strap'
        ]
      },
      {
        id: 'transmission',
        name: 'Transmission',
        slug: 'transmission',
        description: 'The 5-speed manual transmission became iconic, with the 020 series gearboxes.',
        content: '# Transmission Systems\n\n## Manual Transmission\n\n### 4-Speed (Early)\n- Rare option\n- Not recommended for performance\n\n### 5-Speed 020\n- The iconic box\n- Many RatRod builders remove 5th\n- Easy to find parts\n- Strong for stock power\n\n## Final Drive\n\n### Stock Ratios\n- 3.68:1 ( Diesel)\n- 3.94:1 (GTI)\n- 4.17:1 (Racing)\n\n## Clutch\n\n### Options\n- Stock organic\n- Performance puck style\n- Tilton twin disc\n\n## Special: Golf G60 Syncro\n\n- Haldex-style AWD\n- Rare collector item\n- Vulnerable transfer case',
        specs: {
          'Gearbox': '020 5-speed',
          '1st Gear Ratio': '3.78',
          '2nd Gear Ratio': '2.12',
          '3rd Gear Ratio': '1.42',
          '4th Gear Ratio': '1.08',
          '5th Gear Ratio': '0.89',
          'Final Drive': '3.94:1'
        },
        commonIssues: [
          '2nd gear synchro wear',
          'Input bearing noise',
          'Outboard CV joint wear',
          'Selector fork bending'
        ],
        maintenanceTips: [
          'Use correct gear oil',
          'Double check engine mounts',
          'Buyers: check syncros'
        ]
      },
      {
        id: 'body',
        name: 'Body & Interior',
        slug: 'body',
        description: 'The simple two-box design allows for easy restoration and modification.',
        content: '# Body & Interior Systems\n\n## Body Style\n\n- 3-door hatchback (most common)\n- 5-door later in production\n- No B-pillar for easy roll cage\n\n## Rust Areas\n\n### Common Problem Areas\n1. Battery tray\n2. Inner front fenders\n3. Rear wheel arches\n4. Floor pans\n5. Subframe mounts\n\n## Interior\n\n### Dashboard\n- Simple analog gauges\n- Later: digital boost (rare)\n\n### Seats\n- Recaro optional (sought after)\n- Simple bolt-in pattern\n\n## Windows\n\n- Manual winding (most common)\n- Electric: check wiring',
        specs: {
          'Length': '3985mm',
          'Width': '1610mm',
          'Height': '1410mm',
          'Curb Weight': '850kg'
        },
        commonIssues: [
          'Floor pan rust-through',
          'Cracked dashboard',
          'Seatbelt tensioner failure',
          'Window regulator motors'
        ],
        maintenanceTips: [
          'POR-15 floor pans',
          'Regular wax injection',
          'Dielectric grease motors'
        ]
      }
    ]
  },
  {
    id: 'mk2',
    name: 'Mk2',
    slug: 'mk2',
    years: '1984-1992',
    description: 'The legendary second generation that cemented the GTI legacy. Refined styling and improved performance made it an icon of the 80s.',
    models: ['Golf GTI 16V', 'Golf Rallye', 'Golf Country', 'Corrado'],
    image: '/images/mk2.jpg',
    systems: [
      {
        id: 'engine',
        name: 'Engine',
        slug: 'engine',
        description: 'The evolution to the 8V and 16V engines brought significant power increases.',
        content: '# Engine Systems\n\nThe Mk2 continued the hot hatch legacy with the refined 1.8L 8V and the powerful 1.8L 16V DOHC engines.\n\n## Engine Variants\n\n### 1.8L 8V (JH/KR)\n- 107 HP @ 5,250 RPM\n- 101 lb-ft @ 3,000 RPM\n- More torque than Mk1\n\n### 1.8L 16V (KR/PE)\n- 129 HP @ 6,300 RPM\n- 114 lb-ft @ 4,550 RPM\n- DOHC with 16 valves\n- The engine of choice\n\n### 2.0L 16V (3B)\n- 134 HP (German market)\n- 8V head swapped\n\n### 1.6L Diesel (JP)\n- 52 HP (NA)\n- 68 HP ( Diesel)\n\n### 2.1L VR6 (ABV)\n- 190 HP\n- First VR6 in Golf\n- Rare and valuable',
        specs: {
          'Displacement': '1781cc',
          'Configuration': 'Inline 4, Transverse',
          'Valve Train': 'DOHC 16V',
          'Fuel System': 'KE-Motronic Injection',
          'Oil Capacity': '5.2 quarts w/ filter'
        },
        commonIssues: [
          'Vibrator damper failure',
          'Coolant flange leaks',
          'Smaller main bearing size',
          'Cam position sensor failure'
        ],
        maintenanceTips: [
          'Check damper every 50k miles',
          'Use correct coolant'
        ]
      },
      {
        id: 'suspension',
        name: 'Suspension',
        slug: 'suspension',
        description: 'Improved geometry overMk1 with better wheel positioning.',
        content: '# Suspension Systems\n\n## Front\n\nMcPherson design with improved pickup points for steering.\n\n## Rear\n\nTwist beam improvements, specifically for VR6 weight.\n\n### Rear Subframe\n\n- Strengthened mounts\n- Poly bushing compatible\n- VR6 specific parts',
        specs: {
          'Front Track': '1480mm',
          'Rear Track': '1470mm',
          'Wheelbase': '2470mm'
        },
        commonIssues: [
          'Subframe bolt stretch',
          'Broken rear spring cups',
          'Sway bar end links'
        ]
      },
      {
        id: 'brakes',
        name: 'Brakes',
        slug: 'brakes',
        description: 'Larger rotors thanMk1, optional ABS available.',
        content: '# Brake Systems\n\n## Stock\n\n- 256mm front (8V)\n- 288mm front (VR6)\n- Rear disc standard\n\n## ABS\n\n- Optional on later models\n- Requires wheel speed sensors',
        specs: {
          'Master Cylinder': '22.2mm',
          'Front Rotor': '256mm (8V) / 288mm (VR6)',
          'Rear Rotor': '227mm'
        },
        commonIssues: [
          'ABS pump motor',
          'Wheel speed sensors',
          'Proportioning valve'
        ]
      },
      {
        id: 'electrical',
        name: 'Electrical',
        slug: 'electrical',
        description: 'More complex than Mk1 with Motronic fuel injection.',
        content: '# Electrical Systems\n\n## Motronic\n\n### ML 1.1\n- Fullihabition\n- Knock control\n- Idle control\n\n## Charging\n\n- 70A or 90A\n- Temperature compensated\n\n## ECU Location\n\n- Behind glovebox\n- Common moisture issue',
        specs: {
          'Battery': '55AH/70AH',
          'Alternator': '70A / 90A',
          'Fuses': 'Standard blade'
        },
        commonIssues: [
          'ECU moisture damage',
          'Alternator brushes',
          'Fuel pump relay'
        ]
      },
      {
        id: 'transmission',
        name: 'Transmission',
        slug: 'transmission',
        description: 'The 020 continued with improved gear sets.',
        content: '# Transmission Systems\n\n## 020 5-Speed\n\n- Stronger input shaft\n- Better synchros\n- Different ratios\n\n## VR6 Transmission\n\n- 6-speed option\n- Different final drive\n\n## Syncro\n\n- Different case\n- 5-speed only',
        specs: {
          'Gearbox': '020 5-speed',
          '1st': '3.78',
          '5th': '0.82',
          'Final Drive': '3.94:1'
        },
        commonIssues: [
          'Synchro wear (2nd)',
          'Clutch master cylinder',
          'CV boot failure'
        ]
      },
      {
        id: 'body',
        name: 'Body & Interior',
        slug: 'body',
        description: 'More steel thanMk1 with improved rust protection.',
        content: '# Body & Interior\n\n## Improvements\n\n- Better galvanizing\n- More sound deadening\n\n## Rust Areas\n\n1. Rear hatch seams\n2. Door bottoms\n3. Battery tray\n\n## Interior\n\n- Improved materials\n- Digital options\n- Check engine light',
        specs: {
          'Length': '4050mm',
          'Width': '1680mm',
          'Height': '1410mm'
        },
        commonIssues: [
          'Hatch rust',
          'Door handle cracks',
          'Torn seats'
        ]
      }
    ]
  },
  {
    id: 'mk3',
    name: 'Mk3',
    slug: 'mk3',
    years: '1993-1998',
    description: 'The controversial third generation with rounded styling. Introduced the VR6 and marked the end of air-cooled engines.',
    models: ['Golf GTI VR6', 'Golf GTI 2.0L', 'Cabriolet'],
    image: '/images/mk3.jpg',
    systems: [
      {
        id: 'engine',
        name: 'Engine',
        slug: 'engine',
        description: 'Introduction of the VR6 engine and the move to water-cooled everything.',
        content: '# Engine Systems\n\n## VR6\n\n### 2.0L VR6 (ABV)\n- 174 HP (European)\n- 118 lb-ft\n- Unique narrow-angle V6\n\n### 2.8L VR6 (AAA)\n- 174 HP / 180 HP\n- More displacement\n\n## Inline Four\n\n### 2.0L 8V (ABA)\n- 115 HP\n- Automatic available\n\n### 1.9L TDI\n- 90 HP\n- 155 lb-ft\n\n## Changes\n\n- No air cooling\n- OBDI emissions\n- Coil on plug ignition',
        specs: {
          'VR6 Displacement': '1984cc / 2792cc',
          'Configuration': 'VR6 / Inline 4',
          'Valve Train': 'DOHC',
          'Fuel System': 'Motronic ME 7.5'
        },
        commonIssues: [
          'VR6 cam chain stretch',
          'Coolant flanges',
          'PCV failures'
        ]
      },
      {
        id: 'suspension',
        name: 'Suspension',
        slug: 'suspension',
        description: 'More compliant ride with MacPherson front and torsion beam rear.',
        content: '# Suspension\n\n## Front MacPherson\n\n- Improved travel\n- Hydraulic bushings\n\n## Rear Torsion Beam\n\n- Standard VW setup\n- VR6 specific parts',
        specs: {
          'Front Track': '1490mm',
          'Rear Track': '1480mm',
          'Wheelbase': '2500mm'
        }
      },
      {
        id: 'brakes',
        name: 'Brakes',
        slug: 'brakes',
        description: 'Factory ABS, larger rotors for VR6.',
        content: '# Brakes\n\n## Front\n- 280mm VR6\n- 256mm 8V\n\n## Rear\n- 232mm discs\n\n## ABS Standard',
        specs: {
          'Master Cylinder': '22.2mm',
          'Front Rotor': '280mm (VR6)'
        }
      },
      {
        id: 'electrical',
        name: 'Electrical',
        slug: 'electrical',
        description: 'OBDI standard, more electronic integration.',
        content: '# Electrical\n\n## ECU\n\n- OBDI diagnostic port\n- More sensors\n\n## Immobilizer\n\n- First generation\n- Key chip required',
        specs: {
          'OBD': 'OBDI',
          'Battery': '60AH'
        }
      },
      {
        id: 'transmission',
        name: 'Transmission',
        slug: 'transmission',
        description: 'Automatic available, 5 and 6-speed options.',
        content: '# Transmission\n\n## Manual\n\n- 5-speed 020\n- 6-speed (VR6)\n\n## Automatic\n\n- 01M/01P\n- 4-speed\n\n## Syncro\n\n- Discontinued',
        specs: {
          'Gearbox': '020 / 01M',
          'Final Drive': '3.67:1 VR6'
        }
      },
      {
        id: 'body',
        name: 'Body & Interior',
        slug: 'body',
        description: 'Better rust protection, more interior options.',
        content: '# Body & Interior\n\n## Body\n\n- Better galvanizing\n- More complete undercoating\n\n## Rust Areas\n\n1. Lower doors\n2. Hatch\n3. Fuel filler\n\n## Interior\n\n- Leather options\n- Sunroof common',
        specs: {
          'Length': '4140mm',
          'Width': '1735mm',
          'Curb Weight': '1200kg VR6'
        }
      }
    ]
  },
  {
    id: 'mk4',
    name: 'Mk4',
    slug: 'mk4',
    years: '1999-2005',
    description: 'The refined fourth generation. Introduced the legendary 1.8T and marked the golden era of VW tunability.',
    models: ['Golf GTI 1.8T', 'Golf GTI VR6', 'GTI 337 Edition', 'R32'],
    image: '/images/mk4.jpg',
    systems: [
      {
        id: 'engine',
        name: 'Engine',
        slug: 'engine',
        description: 'The 1.8T revolutionized the hot hatch with massive tuning potential.',
        content: '# Engine Systems\n\n## 1.8T (AWU/AVJ)\n\n### Specifications\n- 150 HP @ 5,700 RPM\n- 162 lb-ft @ 1,950 RPM\n- K04-004 turbo\n- Single scroll scroll\n\n## VR6\n\n### 2.8L (AAA)\n- 174 HP\n- Narrow angle V6\n\n### 3.2L R32 (BDS)\n- 241 HP\n- vr6 with different cam\n- OBDII\n\n## 1.9L TDI\n\n- 90-130 HP\n- VNT turbo\n\n## Key Changes\n\n- Coil on plug\n- Knock sensors\n- MAF sensor\n- MAP sensor',
        specs: {
          'Displacement': '1781cc / 2792cc / 3189cc',
          'Configuration': 'I4 Turbo / VR6',
          'Valve Train': 'DOHC 20V / 24V',
          'Turbo': 'K04-004 (1.8T)',
          'Oil Capacity': '6.3 quarts'
        },
        commonIssues: [
          'Cam chain tensioner',
          'Turbo oil supply line',
          'PCV valve',
          'Coil packs',
          'MAF sensor'
        ],
        maintenanceTips: [
          'Upgrade oil feed line',
          'Check cam timing',
          'Use quality turbo oil'
        ]
      },
      {
        id: 'suspension',
        name: 'Suspension',
        slug: 'suspension',
        description: 'Refined MacPherson front and torsion beam rear.',
        content: '# Suspension\n\n## Front\n\nMacPherson struts with forged aluminum spindles.\n\n## Rear\n\nTorsion beam with compliance bushings.\n\n## Subframe\n\n- Poly bushing compatible\n- Lower control arms\n\n## R32 Specific\n\n- Updated geometry\n- Different knuckles',
        specs: {
          'Front Track': '1539mm',
          'Rear Track': '1528mm',
          'Wheelbase': '2517mm'
        },
        commonIssues: [
          'Bad shock absorbers',
          'Worn tie rods',
          'Broken rear spring',
          'Bad control arm'
        ]
      },
      {
        id: 'brakes',
        name: 'Brakes',
        slug: 'brakes',
        description: 'Larger rotors, integrated ABS.',
        content: '# Brakes\n\n## Front\n\n- 288mm (1.8T)\n- 312mm (R32)\n\n## Rear\n\n- 232mm solid disc\n- 272mm (R32)\n\n## ABS\n\n- Standard\n- EBD added\n\n## Upgrades\n\n\n- 4-pot calipers\n- Braided lines',
        specs: {
          'Master Cylinder': '22.2mm',
          'Front Rotor': '312mm (R32)',
          'Rear Rotor': '272mm (R32)'
        },
        commonIssues: [
          'Stuck calipers',
          'Warped rotors',
          'ABS module'
        ]
      },
      {
        id: 'electrical',
        name: 'Electrical',
        slug: 'electrical',
        description: 'OBDII standard, CAN bus beginning.',
        content: '# Electrical\n\n## ECU\n\n- ME 7.1 (1.8T)\n- Simos (VR6)\n\n## Immo\n\n- 3rd generation\n- Transponder key\n\n## CAN Bus\n\n- Starting to appear\n- More integration',
        specs: {
          'Battery': '60AH',
          'Alternator': '140A',
          'System': '12V CAN'
        },
        commonIssues: [
          'Ignition coils',
          'MAF failures',
          'Alternator'
        ]
      },
      {
        id: 'transmission',
        name: 'Transmission',
        slug: 'transmission',
        description: 'New 5 and 6-speed gearboxes.',
        content: '# Transmission\n\n## Manual\n\n### 02A 5-Speed\n\n- Older box\n- Less desirable\n\n### 02M 6-Speed\n\n- 02M is stronger\n- Better ratios\n\n## Automatic\n\n- 01M (4-speed)\n- 09A (5-speed)\n\n## DSG\n\n- First generation\n- 6-speed (R32)',
        specs: {
          'Gearbox': '02M 6-speed',
          '1st': '3.78',
          '6th': '0.65',
          'Final Drive': '3.94:1'
        },
        commonIssues: [
          'Synchro wear',
          'Dual mass flywheel',
          'Pilot bearing'
        ]
      },
      {
        id: 'body',
        name: 'Body & Interior',
        slug: 'body',
        description: 'Best build quality of the lineup era.',
        content: '# Body & Interior\n\n## Body\n\n- Galvanized body\n- 10 year anti-perf\n\n## Rust\n\n1. Door handles\n2. Sunroof drains\n3. Rear hatch\n\n## Interior\n\n- Quality materials\n- Leather common\n- Sunroof',
        specs: {
          'Length': '4149mm',
          'Width': '1735mm',
          'Height': '1440mm',
          'Curb Weight': '1340kg'
        },
        commonIssues: [
          'Window regulators',
          'Sunroof leaks',
          'Vacuum door locks'
        ]
      }
    ]
  },
  {
    id: 'mk5',
    name: 'Mk5',
    slug: 'mk5',
    years: '2006-2009',
    description: 'The controversial styling that polarized fans. Return of the 2.0T FSI and introduction of the TSI.',
    models: ['Golf GTI', 'GTI Edition 30', 'R32', 'GTI Cup'],
    image: '/images/mk5.jpg',
    systems: [
      {
        id: 'engine',
        name: 'Engine',
        slug: 'engine',
        description: 'The legendary 2.0T FSI brought new power levels.',
        content: '# Engine Systems\n\n## 2.0T FSI (BWA)\n\n### Specifications\n- 200 HP @ 5,100 RPM\n- 207 lb-ft @ 1,800 RPM\n- K04-023 turbo\n- Direct injection\n\n## 2.0T FSI (CAW)\n\n\n### Golf R Engine\n- 256 HP\n- Different pistons\n\n## 1.4 TSI\n\n-Twincharged\n- 170 HP supercharged + turbocharged\n\n## Key Changes\n\n- Direct injection\n- Coil packs on injector\n- Variable geometry turbo',
        specs: {
          'Displacement': '1984cc',
          'Configuration': 'Inline 4, Turbo',
          'Valve Train': 'DOHC 16V',
          'Turbo': 'K04-023 / K04-059',
          'Fuel System': 'Direct Injection (TSI)'
        },
        commonIssues: [
          'Carbon buildup',
          'High pressure pump',
          'PCV valve',
          'Turbocharger',
          'Coil pack failures'
        ],
        maintenanceTips: [
          'Walnut blast intake',
          'Catch can recommended',
          'Use 93 octane tuned'
        ]
      },
      {
        id: 'suspension',
        name: 'Suspension',
        slug: 'suspension',
        description: 'MacPherson front, multi-link rear finally.',
        content: '# Suspension\n\n## Front\n\nMacPherson struts with steel knuckles.\n## Rear\n\nMulti-link independent!\n- Finally independent\n- Better ride and handling\n\n## Components\n\n- Spring perch (front)\n- Control arms (rear)\n- Sway bar links\n\n## R32\n\n- Different subframe\n- Aluminum control arms',
        specs: {
          'Front Track': '1515mm',
          'Rear Track': '1520mm',
          'Wheelbase': '2578mm'
        },
        commonIssues: [
          'Rear lateral links',
          'Front springs',
          'Strut mounts'
        ]
      },
      {
        id: 'brakes',
        name: 'Brakes',
        slug: 'brakes',
        description: 'Larger rotors, electronic brake force distribution.',
        content: '# Brakes\n\n## Front\n- 312mm (GTI)\n- 345mm (R)\n\n## Rear\n\n- 282mm solid disc\n\n## Electronic\n\n- EBD\n- ESP standard\n\n## Electronic Parking Brake\n\n- First for VW\n',
        specs: {
          'Master Cylinder': '22.2mm',
          'Front Rotor': '312mm',
          'Rear Rotor': '282mm'
        },
        commonIssues: [
          'EPC light',
          'Wheel speed sensors'
        ]
      },
      {
        id: 'electrical',
        name: 'Electrical',
        slug: 'electrical',
        description: 'Full CAN bus, more integration.',
        content: '# Electrical\n\n## ECU\n\n- Simos/Med 9.1\n- Full CAN bus\n\n## Convenience\n\n- Auto headlights\n- Rain sensing wipers\n\n## Immobilizer\n\n- 4th generation\n- Smart key',
        specs: {
          'Battery': '60AH',
          'Alternator': '140A'
        },
        commonIssues: [
          'Battery drain',
          'Module failures'
        ]
      },
      {
        id: 'transmission',
        name: 'Transmission',
        slug: 'transmission',
        description: 'Improved 6-speed, DSG now 6 and 7-speed.',
        content: '# Transmission\n\n## Manual\n\n### 02Q 6-Speed\n\n- Strong box\n- Good ratios\n\n## DSG (Direct Shift Gear)\n\n### 02E (6-Speed)\n- Wet clutch\n- 350 Nm limit\n\n### 0AM (7-Speed)\n- Newer DSG\n\n## Clutch\n\n- Single plate\n- Dual mass flywheel',
        specs: {
          'Gearbox': '02Q 6-speed',
          '1st': '3.76',
          '6th': '0.68',
          'Final Drive': '3.68:1'
        },
        commonIssues: [
          'Dual mass flywheel',
          'Clutch master',
          'Throwout bearing'
        ]
      },
      {
        id: 'body',
        name: 'Body & Interior',
        slug: 'body',
        description: 'Controversial styling but solid build.',
        content: '# Body & Interior\n\n## Body\n\n- Galvanized\n- Sound insulation\n\n## Rust\n\n1. Sunroof drains\n2. Radiator support\n\n## Interior\n\n- Higher position\n- R32 leather\n',
        specs: {
          'Length': '4222mm',
          'Width': '1785mm',
          'Height': '1465mm',
          'Curb Weight': '1380kg'
        },
        commonIssues: [
          'Sunroof leaks',
          'Window regulator'
        ]
      }
    ]
  },
  {
    id: 'mk6',
    name: 'Mk6',
    slug: 'mk6',
    years: '2010-2014',
    description: 'The refined sixth generation. More conservative styling with improved quality and the return of the GTI to the US.',
    models: ['Golf GTI', 'GTI Performance Package', 'Golf R', 'GTI Wolfsburg Edition'],
    image: '/images/mk6.jpg',
    systems: [
      {
        id: 'engine',
        name: 'Engine',
        slug: 'engine',
        description: 'The updated 2.0T TSI with new turbo and direct injection advances.',
        content: '# Engine Systems\n\n## 2.0T TSI (CCZ)\n\n### Specifications\n- 210 HP @ 6,000 RPM\n- 258 lb-ft @ 2,500 RPM\n- Newer K04 turbo\n- Direct injection Gen 2\n\n## 2.0T TSI (CXC)\n\n### Golf R Engine\n- 256 HP\n- Different turbo\n\n## Key Changes\n\n- Improved DI\n- Water-cooled turbo\n- Exhaust manifold integrated',
        specs: {
          'Displacement': '1984cc',
          'Configuration': 'Inline 4, Turbo',
          'Valve Train': 'DOHC 16V',
          'Turbo': 'K04-047',
          'Fuel System': 'Direct Injection 2'
        },
        commonIssues: [
          ' carbon deposits',
          'High pressure fuel pump',
          'Intake manifold issues'
        ],
        maintenanceTips: [
          ' direct injection walnut blast',
          'Quality fuel',
          'Catch can important'
        ]
      },
      {
        id: 'suspension',
        name: 'Suspension',
        slug: 'suspension',
        description: 'Refined chassis with better NVH.',
        content: '# Suspension\n\n## Front\n\nMcPherson with new knobs.\n## Rear\n\nMulti-link refined.\n\n## DCC (Dynamic Chassis Control)\n\n- Optional adaptive damping\n- Drive select modes',
        specs: {
          'Front Track': '1515mm',
          'Rear Track': '1520mm',
          'Wheelbase': '2578mm'
        }
      },
      {
        id: 'brakes',
        name: 'Brakes',
        slug: 'brakes',
        description: 'Larger optional, XDS brake vectoring.',
        content: '# Brakes\n\n## Front\n- 312mm (GTI)\n\n## Rear\n- 282mm solid\n\n## XDS\n\n- Electronic brake vectoring\n- Part of ESC',
        specs: {
          'Master Cylinder': '22.2mm'
        }
      },
      {
        id: 'electrical',
        name: 'Electrical',
        slug: 'electrical',
        description: 'MIB infotainment, more electronics.',
        content: '# Electrical\n\n## Infotainment\n\n- Touchscreen now\n- Bluetooth\n- USB input\n\n## Sensors\n\n- More integration\n- Lane assist available',
        specs: {
          'Battery': '60AH',
          'Alternator': '140A'
        }
      },
      {
        id: 'transmission',
        name: 'Transmission',
        slug: 'transmission',
        description: 'Improved manual and DSG.',
        content: '# Transmission\n\n## Manual\n\n### 02Q 6-Speed Refined\n\n- Better feel\n- Improved shift quality\n\n## 0AM DSG\n\n- 6-speed wet clutch\n- Updated mechatronics',
        specs: {
          'Gearbox': '02Q 6-speed',
          'Final Drive': '3.68:1'
        }
      },
      {
        id: 'body',
        name: 'Body & Interior',
        slug: 'body',
        description: 'More conservative styling, better quality interiors.',
        content: '# Body & Interior\n\n## Body\n\n- Similar to Mk5\n- Improved galvanizing\n\n## Interior\n\n- Softer materials\n- Better stitching\n- More tech\n\n## Build Quality\n\n- Gap panel improvements',
        specs: {
          'Length': '4255mm',
          'Width': '1790mm',
          'Height': '1443mm',
          'Curb Weight': '1385kg'
        },
        commonIssues: [
          'sunroof drains',
          'Interior squeaks'
        ]
      }
    ]
  },
  {
    id: 'mk7',
    name: 'Mk7',
    slug: 'mk7',
    years: '2015-2020',
    description: 'The MQB platform brings major improvements in technology, safety, and performance.',
    models: ['Golf GTI', 'Golf GTI TCR', 'Golf R', 'GTI Clubsport', 'GTI Rabbit Edition'],
    image: '/images/mk7.jpg',
    systems: [
      {
        id: 'engine',
        name: 'Engine',
        slug: 'engine',
        description: 'The revolutionary MQB engine with advanced turbo and direct injection.',
        content: '# Engine Systems\n\n## 2.0T TSI (CHH/DC) GTI\n\n### Specifications\n- 210 HP / 230 HP (S)\n- 258 lb-ft / 270 lb-ft\n- IHI turbo\n- Direct injection\n\n## 2.0T TSI (CXW) Golf R\n\n### Specifications\n- 292 HP / 296 HP\n- 280 lb-ft\n- Larger turbo\n\n## 1.8T TSI (CNS)\n\n- No longer offered\n\n## Key Changes\n\n- Integrated exhaust manifold\n- Water-cooled turbo\n- VVT on exhaust\n- Auto start/stop',
        specs: {
          'Displacement': '1984cc',
          'Configuration': 'Inline 4, Turbo',
          'Valve Train': 'DOHC 16V',
          'Turbo': 'IHI VF52/57',
          'Fuel System': 'Direct Injection'
        },
        commonIssues: [
          ' carbon buildup',
          'HPFP failures',
          'Turbocharger wastegate'
        ],
        maintenanceTips: [
          'Intake walnut blast',
          'Catch can a must',
          'Use 93 octane'
        ]
      },
      {
        id: 'suspension',
        name: 'Suspension',
        slug: 'suspension',
        description: 'MQB platform brings lighter, stronger components.',
        content: '# Suspension\n\n## Front\n\nMcPherson with new geometry.\n\n## Rear\n\nMulti-link updated.\n## XDS\n\n- Brake-based vectoring\n- Standard on performance\n\n## DCC\n\n- Adaptive damping\n- Drive select\n\n## Golf R\n\n- Different knobs\n- Performance package (R)',
        specs: {
          'Front Track': '1512mm',
          'Rear Track': '1518mm',
          'Wheelbase': '2627mm'
        },
        commonIssues: [
          'Lower control arms',
          'Rear shocks',
          'Alignment issues'
        ]
      },
      {
        id: 'brakes',
        name: 'Brakes',
        slug: 'brakes',
        description: 'Larger rotors standard, red calipers optional.',
        content: '# Brakes\n\n## Front\n- 310mm (Sport) / 340mm (R)\n\n## Rear\n- 310mm solid (R)\n- 272mm (GTI)\n\n## Electronic\n\n- ABS XDS\n- Electronic brake distribution\n\n## Performance Package\n\n- Bigger rotors\n- Red calipers',
        specs: {
          'Master Cylinder': '22.2mm'
        }
      },
      {
        id: 'electrical',
        name: 'Electrical',
        slug: 'electrical',
        description: 'Full digital integration, virtual cockpit.',
        content: '# Electrical\n\n## MIB Infotainment\n\n- Modular infotainment\n- Touchscreen standard\n- CarPlay/Android Auto\n\n## Virtual Cockpit\n\n- Digital gauges\n- Fully customizable\n- Navigation display\n\n## Driver Assistance\n\n- Lane keep\n- Blind spot\n- Park assist',
        specs: {
          'Battery': '68AH AGM',
          'Alternator': '140A / 180A'
        }
      },
      {
        id: 'transmission',
        name: 'Transmission',
        slug: 'transmission',
        description: 'MQB gearbox with improved shift feel.',
        content: '# Transmission\n\n## Manual\n\n### 02Q 6-Speed\n\n- Refined shift action\n- Better cables\n\n## DQ250 6-Speed DSG\n\n- Wet clutch\n- 350 Nm rating\n\n## DQ381 7-Speed DSG\n\n- Newer efficiency\n\n## R 4Motion\n\n- Haldex 5 AWD\n- Drift mode',
        specs: {
          'Gearbox': '02Q 6-speed',
          '1st': '3.76',
          '6th': '0.63',
          'Final Drive': '3.68:1'
        },
        commonIssues: [
          'Mechatronics',
          'Clutch wear high power'
        ]
      },
      {
        id: 'body',
        name: 'Body & Interior',
        slug: 'body',
        description: 'Best safety ratings, most technology.',
        content: '# Body & Interior\n\n## Body\n\n- 5-star safety\n- More high steel\n- Better crash structure\n\n## Interior\n\n- Digital cockpit\n- Massive touchscreen options\n- Leather or cloth\n\n## Build Quality\n\n- Best yet\n- Minimal squeaks',
        specs: {
          'Length': '4268mm',
          'Width': '1799mm',
          'Height': '1452mm',
          'Curb Weight': '1410kg'
        },
        commonIssues: [
          'Window motors',
          'Sunroof drains'
        ]
      }
    ]
  },
  {
    id: 'mk8',
    name: 'Mk8',
    slug: 'mk8',
    years: '2021-Present',
    description: 'The all-new eighth generation. Full digital cockpit and electrified options.',
    models: ['Golf GTI', 'Golf R', 'GTI Clubsport'],
    image: '/images/mk8.jpg',
    systems: [
      {
        id: 'engine',
        name: 'Engine',
        slug: 'engine',
        description: 'The latest evolution with mild hybrid technology.',
        content: '# Engine Systems\n\n## 2.0T TSI (GY) GTI\n\n### Specifications\n- 241 HP @ 5,000 RPM\n- 273 lb-ft @ 1,800 RPM\n- IS38 turbo\n- Mild hybrid eHZ\n\n## 2.0T TSI (DN) Golf R\n\n### Specifications\n- 315 HP\n- 280 lb-ft\n- is38 turbo\n\n## Key Changes\n\n- E-motor in TC (mild hybrid)\n- 48V system\n- Newer injection\n- Active turbo',
        specs: {
          'Displacement': '1984cc',
          'Configuration': 'Inline 4, Turbo Mild Hybrid',
          'Valve Train': 'DOHC 16V',
          'Turbo': 'IS38',
          'Fuel System': 'Direct Injection'
        },
        commonIssues: [
          ' new platform, still learning'
        ],
        maintenanceTips: [
          'Follow break-in guidelines',
          'Use quality 93 octane'
        ]
      },
      {
        id: 'suspension',
        name: 'Suspension',
        slug: 'suspension',
        description: 'Refined MQB-Evo platform brings updated components.',
        content: '# Suspension\n\n## Front\n\nMcPherson with new knobs.\n\n## Rear\n\nMulti-link new design.\n\n## DCC\n\n- Adaptive standard with option\n- Drive select\n- Comfort/Auto/Individual\n\n## Golf R\n\n- Updated AWD system\n- Drift mode',
        specs: {
          'Front Track': '1512mm',
          'Rear Track': '1518mm',
          'Wheelbase': '2627mm'
        }
      },
      {
        id: 'brakes',
        name: 'Brakes',
        slug: 'brakes',
        description: 'Larger rotors, performance-focused.',
        content: '# Brakes\n\n## Front\n\n- 340mm+ available\n\n## Rear\n\n- 310mm solid\n\n## Systems\n\n- ABS XDS\n- Electronic brake distribution\n- ESC Sport',
        specs: {
          'Master Cylinder': '22.2mm'
        }
      },
      {
        id: 'electrical',
        name: 'Electrical',
        slug: 'electrical',
        description: 'Fully digital, minimal physical buttons.',
        content: '# Electrical\n\n## Infotainment\n\n- MIB4 now\n- Wireless carplay\n- Wireless charging\n\n## Virtual Cockpit\n\n- Standard digital\n- Head-up display available\n\n## Driver Assist\n\n- Travel assist\n- Lane keeping plus\n- Area view camera',
        specs: {
          'Battery': '68AH AGM',
          'Alternator': '180A w/ 48V mild hybrid'
        }
      },
      {
        id: 'transmission',
        name: 'Transmission',
        slug: 'transmission',
        description: 'Updated gearboxes with improved efficiency.',
        content: '# Transmission\n\n## Manual\n\n### 02Q 6-Speed\n\n- Updated\n\n## DSG\n\n- DQ381 evo 7-Speed\n- Updated mechatronics\n\n## 4Motion\n\n- Updated Haldex\n- Drift mode (R)',
        specs: {
          'Gearbox': '02Q 6-speed',
          'Final Drive': '3.68:1'
        }
      },
      {
        id: 'body',
        name: 'Body & Interior',
        slug: 'body',
        description: 'New platform, fully digital interior.',
        content: '# Body & Interior\n\n## Body\n\n- MQB-Evo platform\n- Improved safety\n- More electrification\n\n## Interior\n\n- Minimal buttons\n- Touch infotainment\n- Wireless charging\n\n## Build Quality\n\n- All-new design',
        specs: {
          'Length': '4282mm',
          'Width': '1790mm',
          'Height': '1456mm'
        },
        commonIssues: [
          'Software glitches',
          'Touchscreen issues'
        ]
      }
    ]
  },
  {
    id: 'type1',
    name: 'Type 1 / Beetle',
    slug: 'type1',
    years: '1938-2003',
    description: 'The legendary air-cooled Beetle. The most produced single design in history.',
    models: ['Standard Beetle', 'Super Beetle', '1302/1303', 'Volkswagen Nuevo'],
    image: '/images/type1.jpg',
    systems: [
      {
        id: 'engine',
        name: 'Engine',
        slug: 'engine',
        description: 'The iconic air-cooled flat-four defined an era.',
        content: '# Engine Systems\n\n## Air-Cooled Flat-Four\n\n### Early (Type 1)\n- 1131cc 25 HP\n- 25 HP @ 3,200 RPM\n\n### Later (Type 1)\n- 1285cc 34 HP\n- 34 HP @ 3,400 RPM\n\n### 1302/1303\n- 1600cc 48 HP\n- 48 HP @ 4,000 RPM\n\n## Key Features\n\n- Air-cooled by fan\n- Fuel injection (later)\n- Generator/starter combined\n\n## Fan Housing\n\n- Dynamic cooling\n- Radial fan',
        specs: {
          'Displacement': '1131cc - 1600cc',
          'Configuration': 'Flat 4, Air Cooled',
          'Valve Train': 'Sidevalve / OHV',
          'Fuel System': 'Carburetor / Fuel Injection',
          'Oil Capacity': 'quarts'
        },
        commonIssues: [
          'Cylinder crack',
          'Main bearing wear',
          'Fuel tank rust',
          'Generator failure'
        ],
        maintenanceTips: [
          'Check cooling fan',
          'Use proper cam lube'
        ]
      },
      {
        id: 'suspension',
        name: 'Suspension',
        slug: 'suspension',
        description: 'Torsion bar front, swing axle rear.',
        content: '# Suspension\n\n## Front\n\n### Torsion Bar\n\n- Independent front\n- Adjustable ride height\n\n## Rear\n\n### Swing Axle\n- Coil over shock\n- Trailing arm\n\n## Super Beetle\n\n- Strut front\n- Semi-trailing arm rear',
        specs: {}
      },
      {
        id: 'brakes',
        name: 'Brakes',
        slug: 'brakes',
        description: 'Drum brakes front and rear originally.',
        content: '# Brakes\n\n## Front\n\n- Drum (original)\n- Disc (late)\n\n## Rear\n\n- Drum\n\n## Master Cylinder\n\n- Split system',
        specs: {}
      },
      {
        id: 'electrical',
        name: 'Electrical',
        slug: 'electrical',
        description: '6V system originally, positive ground.',
        content: '# Electrical\n\n## Systems\n\n- 6V / 12V\n- Positive ground (6V)\n- Generator/Alternator\n\n## Lighting\n\n- 6V bulbs\n- 12V conversion common',
        specs: {}
      },
      {
        id: 'transmission',
        name: 'Transmission',
        slug: 'transmission',
        description: '4-speed manual, beetle type.',
        content: '# Transmission\n\n## Types\n\n### 4-Speed\n\n- Type 1 box\n- 3.80:1 first gear\n\n## Ratios\n\nStandard beetle ratios',
        specs: {}
      },
      {
        id: 'body',
        name: 'Body & Frame',
        slug: 'body',
        description: 'Unibody construction, famous shape.',
        content: '# Body & Frame\n\n## Body\n\n- Unibody\n- Platform frame\n\n## Rust Areas\n\n1. Floor pans\n2. Rear spare tire well\n3. Tunnel\n\n## Construction\n\n- Seamed metal\n- Box section frame',
        specs: {
          'Length': '4070mm',
          'Width': '1550mm',
          'Height': '1550mm'
        }
      }
    ]
  },
  {
    id: 'type2',
    name: 'Type 2 / Bus',
    slug: 'type2',
    years: '1950-2013',
    description: 'The iconic Microbus. From the splittie to the modern transporter.',
    models: ['T1 Splittie', 'T2 Bay', 'T3 Transporter', 'T4 Eurovan', 'T5 Transporter'],
    image: '/images/type2.jpg',
    systems: [
      {
        id: 'engine',
        name: 'Engine',
        slug: 'engine',
        description: 'Air-cooled flat-four and box-six powering the legend.',
        content: '# Engine Systems\n\n## T1\n\n- 1131cc air-cooled\n- 24 HP\n\n## T2\n\n- 1.6L-2.0L air-cooled\n- 47-70 HP\n\n## Box-Six (T3)\n\n- 2.1L / 2.5L\n- 95 HP\n\n## Water-Cooled (T4)\n\n- VR6 2.8 / 2.5 TDI\n- 140+ HP',
        specs: {}
      },
      {
        id: 'suspension',
        name: 'Suspension',
        slug: 'suspension',
        description: 'Independent front, rear torsion.',
        content: '# Suspension\n\n## Front\n\nTorsion bars independent.',
        specs: {}
      },
      {
        id: 'brakes',
        name: 'Brakes',
        slug: 'brakes',
        description: 'Drum/disc combinations.',
        content: '# Brakes\n\nFront disc available on later.',
        specs: {}
      },
      {
        id: 'electrical',
        name: 'Electrical',
        slug: 'electrical',
        description: 'Evolution from 6V to 12V.',
        content: '# Electrical\n\n6V then 12V changes.',
        specs: {}
      },
      {
        id: 'transmission',
        name: 'Transmission',
        slug: 'transmission',
        description: '4WD options in later models.',
        content: '# Transmission\n\n## Types\n\nFront engine/rear transaxle.',
        specs: {}
      },
      {
        id: 'body',
        name: 'Body',
        slug: 'body',
        description: 'The iconic silhouette.',
        content: '# Body\n\n## Models\n\n- Splittie\n- Bay Window\n- Camper\n\n## Rust\n\nFamous rust issues.',
        specs: {}
      }
    ]
  },
  {
    id: 'aircooled',
    name: 'Air-Cooled Era',
    slug: 'aircooled',
    years: '1938-1998',
    description: 'The air-cooled VWs including Type 1, 2, 3, and early Type 4.',
    models: ['Type 1 Beetle', 'Type 2 Bus', 'Type 3/411', 'Karmann Ghia'],
    image: '/images/aircooled.jpg',
    systems: [
      {
        id: 'cooling',
        name: 'Cooling System',
        slug: 'cooling',
        description: 'The legendary air cooling system.',
        content: '# Air Cooling\n\n## Fan Types\n\n### Radial Fan\n- Early Type 1\n- Belt driven\n\n### Axial Fan\n- Later Type 2\n- More efficient\n\n## Engine Cooling\n\n- Tin squeeze\n- Cooling ducts\n- Fan housing\n\n## Oil Cooling\n\n- Oil cooler option\n- External cooler\n\n## Temperature Control\n\n- Thermostat flap\n- Fresh air box',
        specs: {
          'Cooling Type': 'Air Cooled',
          'Fan': 'Radial / Axial',
          'Temperature Control': 'Thermostat Flap'
        },
        commonIssues: [
          'Fan bearing failure',
          'Cooling tin damage',
          'Thermostat flap stuck'
        ]
      }
    ]
  },
  {
    id: 'watercooled',
    name: 'Water-Cooled Era',
    slug: 'watercooled',
    years: '1980-Present',
    description: 'The modern water-cooled VWs from the first Vanagon to present.',
    models: ['Vanagon', 'Transporter T4', 'Golf/Bora', 'Jetta', 'Passat'],
    image: '/images/watercooled.jpg',
    systems: [
      {
        id: 'cooling',
        name: 'Cooling System',
        slug: 'cooling',
        description: 'Engine cooling from simple to complex.',
        content: '# Cooling Systems\n\n## Early Water-Cooled\n\n### Vanagon\n\n- 2.0L / 2.1L\n- Front mount radiator\n\n### Type 4 Water-Cooled (Passat)\n\n- Longitudinal engine\n- Traditional radiator\n\n## Modern\n\n### Transverse\n\n- Front radiator\n- Electric fans\n- Intercooler\n\n## Cooling Components\n\n- Radiator\n- Water pump\n- Thermostat\n- Fans',
        specs: {
          'System Type': 'Liquid Cooling',
          'Coolant Capacity': 'varies',
          'Thermostat': '82C / 87C'
        },
        commonIssues: [
          'Water pump failure',
          'Thermostat stuck',
          'Radiator leak',
          'Coolant loss'
        ],
        maintenanceTips: [
          'Check coolant yearly',
          'Replace hoses at 100k',
          'Use correct coolant'
        ]
      }
    ]
  }
];
export default generations;