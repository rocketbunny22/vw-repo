type IconName =
  | 'body'
  | 'brakes'
  | 'electrical'
  | 'engine'
  | 'generation'
  | 'guide'
  | 'pdf'
  | 'pin'
  | 'suspension'
  | 'transmission'
  | 'vehicle'
  | 'warning';

interface UiIconProps {
  name: IconName;
  className?: string;
  title?: string;
}

const iconPaths: Record<IconName, string[]> = {
  body: [
    'M5 16h14l-1.4-4.2A2 2 0 0015.7 10H8.3a2 2 0 00-1.9 1.8L5 16z',
    'M7 16v2m10-2v2M6 18h12',
  ],
  brakes: [
    'M12 21a9 9 0 100-18 9 9 0 000 18z',
    'M12 15a3 3 0 100-6 3 3 0 000 6z',
    'M6.6 17.4l2.1-2.1M15.3 8.7l2.1-2.1',
  ],
  electrical: ['M13 2L5 14h6l-1 8 9-13h-6l1-7z'],
  engine: [
    'M7 9h9l2 2v5l-2 2H8l-2-2v-5l1-2z',
    'M10 9V6h4v3M4 13H2m20 0h-2M8 6h8M11 18v3h2v-3',
  ],
  generation: ['M4 16l4-8 4 8 4-8 4 8', 'M3 19h18'],
  guide: ['M5 4h10a4 4 0 014 4v12H9a4 4 0 00-4-4V4z', 'M5 4v12m4-8h6m-6 4h6'],
  pdf: ['M7 3h7l5 5v13H7V3z', 'M14 3v5h5M9 14h6M9 17h6'],
  pin: ['M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z', 'M12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z'],
  suspension: ['M7 4v5m10-5v5M6 9h12M8 9v11m8-11v11', 'M9 12h6M9 15h6M9 18h6'],
  transmission: [
    'M7 6a2 2 0 100 4 2 2 0 000-4zM17 6a2 2 0 100 4 2 2 0 000-4zM12 14a2 2 0 100 4 2 2 0 000-4z',
    'M7 10v4h5m5-4v4h-5',
  ],
  vehicle: [
    'M4 15h16l-1.5-4.5A2 2 0 0016.6 9H7.4a2 2 0 00-1.9 1.5L4 15z',
    'M6.5 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  ],
  warning: ['M12 3l9 16H3L12 3z', 'M12 9v4M12 17h.01'],
};

export type { IconName };

export default function UiIcon({ name, className = 'h-5 w-5', title }: UiIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {iconPaths[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
