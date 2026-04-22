export interface Person {
  id: string;
  name: string;
  photo: string; // base64 data URL
  data: Record<string, unknown>;
}

export interface RelationLink {
  source: string;
  target: string;
  label: string;
}

const avatar = (initials: string, bg: string, fg = '#fff') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill="${bg}"/>
    <circle cx="50" cy="38" r="18" fill="${fg}" opacity="0.9"/>
    <ellipse cx="50" cy="80" rx="26" ry="20" fill="${fg}" opacity="0.9"/>
    <text x="50" y="44" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="${bg}">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const persons: Person[] = [
  {
    id: 'p1',
    name: 'Ana García',
    photo: avatar('AG', '#2563eb'),
    data: {
      cargo: 'Directora General',
      departamento: 'Dirección',
      email: 'ana.garcia@empresa.com',
      telefono: '+34 600 111 222',
      ubicacion: 'Madrid',
      añosEmpresa: 12,
    },
  },
  {
    id: 'p2',
    name: 'Carlos López',
    photo: avatar('CL', '#059669'),
    data: {
      cargo: 'Jefe de Ingeniería',
      departamento: 'Tecnología',
      email: 'carlos.lopez@empresa.com',
      telefono: '+34 600 333 444',
      ubicacion: 'Barcelona',
      añosEmpresa: 7,
    },
  },
  {
    id: 'p3',
    name: 'María Torres',
    photo: avatar('MT', '#dc2626'),
    data: {
      cargo: 'Diseñadora Senior',
      departamento: 'Producto',
      email: 'maria.torres@empresa.com',
      telefono: '+34 600 555 666',
      ubicacion: 'Valencia',
      añosEmpresa: 4,
    },
  },
  {
    id: 'p4',
    name: 'Pedro Ruiz',
    photo: avatar('PR', '#d97706'),
    data: {
      cargo: 'Desarrollador Full Stack',
      departamento: 'Tecnología',
      email: 'pedro.ruiz@empresa.com',
      telefono: '+34 600 777 888',
      ubicacion: 'Sevilla',
      añosEmpresa: 3,
    },
  },
  {
    id: 'p5',
    name: 'Laura Sánchez',
    photo: avatar('LS', '#7c3aed'),
    data: {
      cargo: 'Analista de Datos',
      departamento: 'BI & Analytics',
      email: 'laura.sanchez@empresa.com',
      telefono: '+34 600 999 000',
      ubicacion: 'Bilbao',
      añosEmpresa: 5,
    },
  },
  {
    id: 'p6',
    name: 'Javier Mora',
    photo: avatar('JM', '#0891b2'),
    data: {
      cargo: 'DevOps Engineer',
      departamento: 'Tecnología',
      email: 'javier.mora@empresa.com',
      telefono: '+34 600 112 233',
      ubicacion: 'Zaragoza',
      añosEmpresa: 6,
    },
  },
];

export const links: RelationLink[] = [
  { source: 'p1', target: 'p2', label: 'Gestiona' },
  { source: 'p1', target: 'p5', label: 'Gestiona' },
  { source: 'p2', target: 'p3', label: 'Colabora' },
  { source: 'p2', target: 'p4', label: 'Lidera' },
  { source: 'p2', target: 'p6', label: 'Lidera' },
  { source: 'p3', target: 'p4', label: 'Trabaja con' },
  { source: 'p5', target: 'p4', label: 'Asesora' },
  { source: 'p6', target: 'p4', label: 'Soporta' },
];

export const mapLocations = [
  { label: 'Madrid, España', coordinates: { lat: 40.4168, lng: -3.7038 } },
  { label: 'Barcelona, España', coordinates: { lat: 41.3851, lng: 2.1734 } },
  { label: 'Sevilla, España', coordinates: { lat: 37.3891, lng: -5.9845 } },
];
