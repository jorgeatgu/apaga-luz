import { width_mobile } from './utils.js';
import { chunkedTask, batchDOMUpdates, throttle } from './performance-utils.js';
import { inpOptimizer } from './inp-optimizer.js';

// Event delegation manager para tablas
class TableEventManager {
  constructor() {
    this.initialized = false;
    this.tableContainers = [];
  }

  init() {
    if (this.initialized) return;

    // Identificar contenedores de tabla principales
    this.tableContainers = [
      '.container-table-price-left',
      '.container-table-price-right',
      '.table-next-day-grid-left',
      '.table-next-day-grid-right'
    ];

    this.setupEventDelegation();
    this.initialized = true;
  }

  setupEventDelegation() {
    // Usar un solo listener para todos los contenedores de tabla
    this.tableContainers.forEach(selector => {
      const container = document.querySelector(selector);
      if (container) {
        // Optimizar hover y click events usando delegación
        const optimizedHandler = inpOptimizer.createOptimizedHandler(
          this.handleTableInteraction.bind(this),
          { priority: 'normal' }
        );

        // Event delegation para clicks
        container.addEventListener('click', optimizedHandler, {
          passive: true
        });

        // Throttle hover events para mejor performance
        const throttledHover = throttle(this.handleTableHover.bind(this), 16);
        container.addEventListener('mouseover', throttledHover, {
          passive: true
        });
      }
    });
  }

  handleTableInteraction(e) {
    const target = e.target;
    const priceElement = target.closest('.container-table-price-element');

    if (
      priceElement &&
      !priceElement.classList.contains('element-hour-disabled')
    ) {
      // Manejar click en elemento de precio
      this.handlePriceElementClick(priceElement, e);
    }
  }

  handleTableHover(e) {
    const target = e.target;
    const priceElement = target.closest('.container-table-price-element');

    if (priceElement) {
      // Efectos visuales de hover optimizados
      requestAnimationFrame(() => {
        priceElement.style.transform = 'scale(1.02)';
        priceElement.style.willChange = 'transform';
      });

      // Limpiar después de un tiempo
      setTimeout(() => {
        requestAnimationFrame(() => {
          priceElement.style.transform = '';
          priceElement.style.willChange = 'auto';
        });
      }, 200);
    }
  }

  handlePriceElementClick(element, event) {
    // Aquí se pueden agregar comportamientos específicos al hacer click
    // Por ejemplo: mostrar detalles, copiar al clipboard, etc.
    console.log('Price element clicked:', element);
  }
}

// Instancia global del manager
const tableEventManager = new TableEventManager();

// Virtual Scrolling Manager for large tables
class VirtualScrollManager {
  constructor() {
    this.observers = new Map();
    this.virtualizedTables = new Set();
  }

  virtualize(table, threshold = 50) {
    if (table.rows.length <= threshold || this.virtualizedTables.has(table)) {
      return;
    }

    this.virtualizedTables.add(table);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.rows);

    if (rows.length <= threshold) return;

    // Store original rows data
    const rowData = rows.map(row => ({
      html: row.outerHTML,
      height: row.offsetHeight || 40 // fallback height
    }));

    // Calculate virtual container height
    const totalHeight = rowData.reduce((sum, row) => sum + row.height, 0);

    // Create virtual container
    const virtualContainer = document.createElement('div');
    virtualContainer.style.height = `${totalHeight}px`;
    virtualContainer.style.position = 'relative';
    virtualContainer.style.contain = 'layout style paint';

    // Create visible viewport
    const viewport = document.createElement('div');
    viewport.style.position = 'absolute';
    viewport.style.top = '0';
    viewport.style.width = '100%';
    viewport.style.contain = 'layout style';

    virtualContainer.appendChild(viewport);

    // Replace tbody content
    tbody.innerHTML = '';
    tbody.appendChild(virtualContainer);

    // Virtual scrolling logic
    let startIndex = 0;
    let endIndex = Math.min(20, rows.length); // Show 20 rows initially
    let scrollTop = 0;

    const updateVisibleRows = () => {
      const containerRect = table.getBoundingClientRect();
      const rowHeight = rowData[0]?.height || 40;
      const visibleCount = Math.ceil(containerRect.height / rowHeight) + 10; // 10 buffer rows

      startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 5);
      endIndex = Math.min(rows.length, startIndex + visibleCount);

      // Clear viewport
      viewport.innerHTML = '';

      // Add visible rows
      for (let i = startIndex; i < endIndex; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.innerHTML = rowData[i].html;
        rowDiv.style.position = 'absolute';
        rowDiv.style.top = `${i * rowHeight}px`;
        rowDiv.style.width = '100%';
        rowDiv.style.contain = 'layout style';
        viewport.appendChild(rowDiv.firstElementChild);
      }
    };

    // Throttled scroll handler
    const throttledScroll = throttle(() => {
      const rect = table.getBoundingClientRect();
      scrollTop = window.pageYOffset - rect.top + window.innerHeight;

      requestAnimationFrame(updateVisibleRows);
    }, 16);

    // Initial render
    updateVisibleRows();

    // Listen to scroll events
    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Store cleanup function
    this.observers.set(table, () => {
      window.removeEventListener('scroll', throttledScroll);
      this.virtualizedTables.delete(table);
    });
  }

  cleanup(table) {
    const cleanup = this.observers.get(table);
    if (cleanup) {
      cleanup();
      this.observers.delete(table);
    }
  }
}

// Global instance
const virtualScrollManager = new VirtualScrollManager();

export function create_new_table(data_table, selector, type_of_filter) {
  let data;
  if (type_of_filter === 'year') {
    data_table.forEach(element => {
      element.year = +element.dia.split('/')[2];
    });
    data = data_table.sort((a, b) => a.year - b.year);
  } else {
    data = data_table.sort((a, b) => new Date(a.dia) - new Date(b.dia));
  }

  // Usar DocumentFragment para construir la tabla completa antes de insertarla
  const fragment = document.createDocumentFragment();
  const table = document.createElement('table');
  table.classList.add('table-same-day');
  // Add CSS containment for better performance
  table.style.contain = 'layout style paint';
  const header = table.createTHead().insertRow();
  header.classList.add('header-same-day');

  //Array para crear el header de la tabla
  //nos quedamos con las fechas, y se eliminan
  //los duplicados
  const array_of_dates = [...new Set(data.map(({ dia }) => dia))];

  //Se añade el string Hora que representa la
  //primera columna
  array_of_dates.unshift('Hora');

  /*Se aplica un map para parsear las fechas
  y dejar solamente el año para el header
  si el filtro es de año, o mostrar dd/mm/yyyy
  si el filtro es de día*/
  array_of_dates.map((day, index) => {
    if (day === 'Hora') {
      header.insertCell(index).innerText = day;
    }
    if (day !== 'Hora' && type_of_filter === 'day') {
      const day_month_year = `${day.split('/')[0]}/${day.split('/')[1]}/${
        day.split('/')[2]
      }`;
      header.insertCell(index).innerText = day_month_year;
    }
    if (day !== 'Hora' && type_of_filter === 'year') {
      header.insertCell(index).innerText = day.split('/')[2];
    }
  });

  const body = document.createElement('tbody');
  body.classList.add('tbody-same-day');
  table.appendChild(body);

  //Array con las horas del día,
  //para poder crear una row por hora
  const array_of_hours = [...new Set(data.map(({ hora }) => hora))];

  // Crear todas las filas en memoria antes de insertarlas
  const rowsFragment = document.createDocumentFragment();

  // Process rows in chunks for better INP performance (optimized threshold)
  if (array_of_hours.length > 8) {
    // For large tables, use chunked processing
    chunkedTask(
      array_of_hours,
      th => {
        let data_filter_hours = data.filter(({ hora }) => hora === th);
        const row = document.createElement('tr');
        row.classList.add('row-same-day');

        const firstCell = document.createElement('td');
        firstCell.textContent = `${data_filter_hours[0].hora.split('-')[0]}:00`;
        row.appendChild(firstCell);

        const max_value = Math.max(
          ...data_filter_hours.map(({ precio }) => precio)
        );
        const min_value = Math.min(
          ...data_filter_hours.map(({ precio }) => precio)
        );

        data_filter_hours.forEach(({ precio, dia }, index) => {
          const new_cell = document.createElement('td');
          new_cell.textContent = `${(precio / 1000).toFixed(3)} €`;

          if (dia !== 'Hora' && type_of_filter === 'day') {
            let parse_date_content = `${dia.split('/')[1]}/${
              dia.split('/')[0]
            }/${dia.split('/')[2]}`;
          }

          if (precio === max_value) {
            new_cell.style.backgroundColor = 'var(--red-light)';
            new_cell.style.fontWeight = 'bold';
          }

          if (precio === min_value) {
            new_cell.style.fontWeight = 'bold';
            new_cell.style.backgroundColor = 'var(--green-light)';
          }

          row.appendChild(new_cell);
        });

        rowsFragment.appendChild(row);
      },
      {
        chunkSize: 4, // Smaller chunks for better INP
        onComplete: () => {
          // Use rAF for smooth insertion
          requestAnimationFrame(() => {
            body.appendChild(rowsFragment);
          });
        }
      }
    );
  } else {
    // For small tables, process synchronously
    array_of_hours.forEach(th => {
      let data_filter_hours = data.filter(({ hora }) => hora === th);
      const row = document.createElement('tr');
      row.classList.add('row-same-day');

      const firstCell = document.createElement('td');
      firstCell.textContent = `${data_filter_hours[0].hora.split('-')[0]}:00`;
      row.appendChild(firstCell);

      const max_value = Math.max(
        ...data_filter_hours.map(({ precio }) => precio)
      );
      const min_value = Math.min(
        ...data_filter_hours.map(({ precio }) => precio)
      );

      data_filter_hours.forEach(({ precio, dia }, index) => {
        const new_cell = document.createElement('td');
        new_cell.textContent = `${(precio / 1000).toFixed(3)} €`;

        if (dia !== 'Hora' && type_of_filter === 'day') {
          let parse_date_content = `${dia.split('/')[1]}/${dia.split('/')[0]}/${
            dia.split('/')[2]
          }`;
        }

        if (precio === max_value) {
          new_cell.style.backgroundColor = 'var(--red-light)';
          new_cell.style.fontWeight = 'bold';
        }

        if (precio === min_value) {
          new_cell.style.fontWeight = 'bold';
          new_cell.style.backgroundColor = 'var(--green-light)';
        }

        row.appendChild(new_cell);
      });

      rowsFragment.appendChild(row);
    });

    // Insert all rows at once
    body.appendChild(rowsFragment);
  }

  // Añadir la tabla completa al documento
  fragment.appendChild(table);

  // Una sola operación DOM para insertar todo
  requestAnimationFrame(() => {
    const container = document.getElementById(selector);
    if (container) {
      // Add CSS containment to the container for better performance
      container.style.contain = 'layout';
      container.appendChild(fragment);

      // Inicializar event delegation si es necesario
      tableEventManager.init();

      // Aplicar virtual scrolling si la tabla es muy grande
      requestIdleCallback(
        () => {
          virtualScrollManager.virtualize(table);
        },
        { timeout: 1000 }
      );
    }
  });

  //Sorting table https://stackoverflow.com/questions/14267781/sorting-html-table-with-javascript/49041392#49041392
  if (width_mobile > 763) {
    const getCellValue = (tr, idx) =>
      tr.children[idx].innerText || tr.children[idx].textContent;

    const comparer = (idx, asc) => (a, b) =>
      ((v1, v2) =>
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2)
          ? v1 - v2
          : v1.toString().localeCompare(v2))(
        getCellValue(asc ? a : b, idx),
        getCellValue(asc ? b : a, idx)
      );
    let asc = true;
    // Usar delegación de eventos con throttling para mejorar el rendimiento
    const tableHeader = document.querySelector(
      `#${selector} table .header-same-day`
    );
    if (tableHeader) {
      const handleSort = throttle(event => {
        const th = event.target.closest('td');
        if (!th) return;

        // Use double rAF for better performance during sorting
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            sortDirectionIcon(asc, th);
            const table = th.closest('table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));

            // Batch sort operations
            const sortedFragment = document.createDocumentFragment();

            // Optimize sorting with hint for GPU acceleration
            tbody.style.willChange = 'contents';

            rows
              .sort(
                comparer(
                  Array.from(th.parentNode.children).indexOf(th),
                  (asc = !asc)
                )
              )
              .forEach(tr => sortedFragment.appendChild(tr));

            // Single DOM operation for reordering
            tbody.appendChild(sortedFragment);

            // Cleanup will-change after animation
            setTimeout(() => {
              tbody.style.willChange = 'auto';
            }, 300);
          });
        });
      }, 200);

      tableHeader.addEventListener('click', handleSort, { passive: true });
    }
  }

  function sortDirectionIcon(asc, target) {
    document
      .querySelectorAll(`#${selector} table .header-same-day td`)
      .forEach(th => th.classList.remove('sorted-down', 'sorted-up'));
    const sorted_class = asc ? 'sorted-up' : 'sorted-down';
    target.classList.add(sorted_class);
  }
}

export function table_price_tomorrow(
  data_hours,
  element,
  compensacion = false
) {
  const container = document.querySelector('.table-next-day');
  const table_grid = document.querySelector(element);
  if (!container || !table_grid) return;

  // Early return if no data
  if (!data_hours || data_hours.length === 0) return;

  let title;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  };

  const string_table_tomorrow = compensacion ? 'Compensación gas' : 'luz';

  if (!document.querySelector('.container-table-next-day-title')) {
    title = `<summary><h2 class="container-table-next-day-title"><span style="font-weight: normal; pointer-events:none;">El precio de la ${string_table_tomorrow} mañana </span> ${tomorrow.toLocaleDateString(
      'es-ES',
      options
    )}</h2></summary>`;
    container.insertAdjacentHTML('afterbegin', title);
  }

  // Use DocumentFragment for better performance
  const fragment = document.createDocumentFragment();

  for (let element of data_hours) {
    const { price, hour, priceColor, tramo } = element;
    const transform_hour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    const tramoCssClass = compensacion ? '' : `tramo-${tramo}`;

    // Create DOM elements for better performance
    const blockDiv = document.createElement('div');
    blockDiv.className = 'container-table-price-element';

    const hourSpan = document.createElement('span');
    hourSpan.className = `container-table-price-element-hour tramo-hidden ${
      priceColor || ''
    } ${tramoCssClass}`;
    hourSpan.textContent = transform_hour;

    const priceSpan = document.createElement('span');
    priceSpan.className = 'container-table-price-element-price';
    priceSpan.textContent = `${price} € kWh`;

    blockDiv.appendChild(hourSpan);
    blockDiv.appendChild(priceSpan);
    fragment.appendChild(blockDiv);
  }

  // Single DOM operation with performance optimization
  requestAnimationFrame(() => {
    table_grid.appendChild(fragment);

    // Defer event delegation initialization
    requestIdleCallback(
      () => {
        tableEventManager.init();
      },
      { timeout: 500 }
    );
  });
}

export function remove_table(element) {
  // Optimized: Use innerHTML = '' instead of removeChild loop
  const container_table_ = document.querySelector(element);
  if (container_table_) {
    container_table_.innerHTML = '';
  }
}

export function remove_tables() {
  // Optimized: Use innerHTML = '' instead of removeChild loops
  // This is significantly faster for clearing multiple elements
  // Use rAF to prevent blocking the main thread
  requestAnimationFrame(() => {
    const containers = [
      document.querySelector('.container-table-price-left'),
      document.querySelector('.container-table-price-right')
    ].filter(Boolean); // Remove null elements

    containers.forEach((container, index) => {
      if (container.children.length > 0) {
        container.innerHTML = '';
        // CLS Fix: Show skeleton immediately after clearing to prevent layout shift
        const selector =
          index === 0
            ? '.container-table-price-left'
            : '.container-table-price-right';
        showTableSkeleton(selector);
      }
    });
  });
}

export function remove_tables_tomorrow() {
  // Optimized: Use innerHTML = '' instead of removeChild loops with rAF
  requestAnimationFrame(() => {
    const containers = [
      document.querySelector('.table-next-day-grid-left'),
      document.querySelector('.table-next-day-grid-right')
    ].filter(Boolean);

    containers.forEach(container => {
      if (container.children.length > 0) {
        container.innerHTML = '';
      }
    });
  });
}

// CLS Fix: Function to show skeleton while loading
function showTableSkeleton(element) {
  const container = document.querySelector(element);
  if (!container) return;

  // Clear existing content
  container.innerHTML = '';

  // Create skeleton elements (12 per container to match real data)
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 12; i++) {
    const skeletonDiv = document.createElement('div');
    skeletonDiv.className = 'price-skeleton';
    fragment.appendChild(skeletonDiv);
  }

  container.appendChild(fragment);
}

export function table_price(data_hours, element) {
  const container = document.querySelector(element);
  if (!container) return;

  // Clear container completely (including skeletons) before adding real data
  container.innerHTML = '';

  // Show skeleton briefly to prevent CLS if no data yet
  if (!data_hours || data_hours.length === 0) {
    showTableSkeleton(element);
    return;
  }

  // Cache DOM queries para evitar reconsultas
  const checkboxHours = document.getElementById('checkbox-hours');
  const get_value_checkbox_hours = checkboxHours
    ? checkboxHours.checked
    : false;

  const today = new Date();
  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };

  const getElementDate = document.getElementById('section-subtitle-date');
  if (getElementDate) {
    getElementDate.textContent = `${today.toLocaleDateString(
      'es-ES',
      options
    )}`;
  }

  // Use DocumentFragment for better performance with batch processing
  const fragment = document.createDocumentFragment();

  // Process elements in chunks for better INP (optimized threshold)
  if (data_hours.length > 8) {
    chunkedTask(
      data_hours,
      elements => {
        const { price, hour, priceColor, hourHasPassed, tramo } = elements;
        const transform_hour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
        const hour_has_passed_class =
          hourHasPassed && get_value_checkbox_hours
            ? 'element-hour-disabled'
            : '';

        // Create DOM elements with CSS containment hints
        const blockDiv = document.createElement('div');
        blockDiv.className = `${hour_has_passed_class} container-table-price-element`;
        blockDiv.style.contain = 'layout style'; // Performance hint

        const hourSpan = document.createElement('span');
        hourSpan.className = `container-table-price-element-hour tramo-hidden ${priceColor} tramo-${tramo}`;
        hourSpan.textContent = transform_hour;

        const priceSpan = document.createElement('span');
        priceSpan.className = 'container-table-price-element-price';
        priceSpan.textContent = `${price} € kWh`;

        blockDiv.appendChild(hourSpan);
        blockDiv.appendChild(priceSpan);
        fragment.appendChild(blockDiv);
      },
      {
        chunkSize: 4, // Smaller chunks for better responsiveness
        onComplete: () => {
          // Use rAF for smooth insertion and better INP
          requestAnimationFrame(() => {
            container.appendChild(fragment);
            // Initialize event delegation after DOM is ready
            requestIdleCallback(
              () => {
                tableEventManager.init();
              },
              { timeout: 500 }
            );
          });
        }
      }
    );
    return; // Exit early to avoid synchronous processing
  }

  // Synchronous processing for small datasets
  for (let elements of data_hours) {
    const { price, hour, priceColor, hourHasPassed, tramo } = elements;
    const transform_hour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    const hour_has_passed_class =
      hourHasPassed && get_value_checkbox_hours ? 'element-hour-disabled' : '';

    // Create DOM elements with performance hints
    const blockDiv = document.createElement('div');
    blockDiv.className = `${hour_has_passed_class} container-table-price-element`;
    blockDiv.style.contain = 'layout style';

    const hourSpan = document.createElement('span');
    hourSpan.className = `container-table-price-element-hour tramo-hidden ${priceColor} tramo-${tramo}`;
    hourSpan.textContent = transform_hour;

    const priceSpan = document.createElement('span');
    priceSpan.className = 'container-table-price-element-price';
    priceSpan.textContent = `${price} € kWh`;

    blockDiv.appendChild(hourSpan);
    blockDiv.appendChild(priceSpan);
    fragment.appendChild(blockDiv);
  }

  // Single DOM operation with performance optimization
  requestAnimationFrame(() => {
    container.appendChild(fragment);

    // Defer event delegation initialization for better INP
    requestIdleCallback(
      () => {
        tableEventManager.init();
      },
      { timeout: 500 }
    );
  });
}
