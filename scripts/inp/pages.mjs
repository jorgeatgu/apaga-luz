// Páginas e interacciones medidas: las del apartado 4 del diagnóstico
// (docs/investigacion/inp-movil.md, fuera de git).
// El `id` es la clave con la que el comparador cruza dos resultados: no se cambia.

const MENU = { id: 'menu', label: 'Abrir menú', selector: '.menu-toggle' };

export const PAGES = [
  {
    path: '/',
    interactions: [
      {
        id: 'tramos',
        label: 'Filtro «Mostrar franjas horarias»',
        selector: '#tramos'
      },
      MENU,
      {
        id: 'order-price',
        label: 'Ordenar por precio',
        selector: '#order-price'
      },
      { id: 'order-hour', label: 'Ordenar por hora', selector: '#order-hour' },
      {
        id: 'checkbox-hours',
        label: 'Checkbox «horas pasadas»',
        selector: '#checkbox-hours'
      },
      {
        id: 'hour-cell',
        label: 'Tocar una hora de la tabla',
        selector: '.container-table-price-element'
      }
    ]
  },
  {
    path: '/precio-luz-manana/',
    interactions: [
      {
        id: 'order-price',
        label: 'Ordenar por precio',
        selector: '#order-price-next'
      },
      {
        id: 'order-hour',
        label: 'Ordenar por hora',
        selector: '#order-hour-next'
      },
      MENU,
      // No hay <details>: es el <summary> suelto del título, que solo existe si hay datos de mañana.
      {
        id: 'details',
        label: 'Abrir <details>',
        selector: '.table-next-day summary'
      }
    ]
  },
  {
    path: '/horas-baratas-luz/',
    interactions: [
      {
        id: 'profile',
        label: 'Cambiar perfil de consumo',
        selector: 'label[for="profile-evening"]'
      },
      {
        id: 'calculate',
        label: 'Calcular ahorro',
        selector: '#calculate-savings'
      },
      MENU,
      { id: 'faq', label: 'Abrir FAQ', selector: '.faq-title-element' },
      { id: 'slider', label: 'Mover slider', selector: '#high-usage' }
    ]
  },
  {
    path: '/graficas/',
    interactions: [
      MENU,
      {
        id: 'sort-table',
        label: 'Ordenar tabla (cabecera)',
        selector: '.header-same-day td'
      },
      {
        id: 'details-table',
        label: 'Plegar <details> de la tabla',
        selector: '.details-table summary'
      },
      { id: 'chart', label: 'Tocar gráfica d3', selector: '.overlay' }
    ]
  },
  {
    path: '/tipos-tarifas-electricas/',
    interactions: [
      MENU,
      { id: 'calculate', label: 'Calcular', selector: '#calculate-btn' },
      { id: 'faq', label: 'Abrir FAQ', selector: '.faq-title-element' },
      { id: 'slider', label: 'Mover slider', selector: '#consumption-valley' }
    ]
  }
];
