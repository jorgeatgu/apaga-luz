import { width_mobile } from './utils.js';

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
  const table = document.createElement('table');
  table.classList.add('table-same-day');
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

  //For sobre cada hora, filtramos los datos
  //con la hora para añadir los datos de cada
  //año en la row de la tabla.
  array_of_hours.forEach(th => {
    let data_filter_hours = data.filter(({ hora }) => hora === th);
    const row = body.insertRow();
    row.classList.add('row-same-day');
    row.insertCell(0).innerText = `${
      data_filter_hours[0].hora.split('-')[0]
    }:00`;

    const max_value = Math.max(
      ...data_filter_hours.map(({ precio }) => precio)
    );
    const min_value = Math.min(
      ...data_filter_hours.map(({ precio }) => precio)
    );

    data_filter_hours.map(({ precio, dia }, index) => {
      const new_cell = row.insertCell(index + 1);
      new_cell.innerText = `${(precio / 1000).toFixed(3)} €`;
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
    });
  });

  document.getElementById(selector).appendChild(table);

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
    document
      .querySelectorAll(`#${selector} table .header-same-day td`)
      .forEach(th =>
        th.addEventListener('click', event => {
          const { target } = event;
          sortDirectionIcon(asc, target);
          const table = th.closest('table');
          const tbody = table.querySelector('tbody');
          Array.from(tbody.querySelectorAll('tr'))
            .sort(
              comparer(
                Array.from(th.parentNode.children).indexOf(th),
                (asc = !asc)
              )
            )
            .forEach(tr => tbody.appendChild(tr));
        })
      );
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
    const { price, hour, zone, tramo } = element;
    const transform_hour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    const tramoCssClass = compensacion ? '' : `tramo-${tramo}`;

    // Create DOM elements for better performance
    const blockDiv = document.createElement('div');
    blockDiv.className = 'container-table-price-element';

    const hourSpan = document.createElement('span');
    hourSpan.className = `container-table-price-element-hour tramo-hidden ${zone} ${tramoCssClass}`;
    hourSpan.textContent = transform_hour;

    const priceSpan = document.createElement('span');
    priceSpan.className = 'container-table-price-element-price';
    priceSpan.textContent = `${price} € kWh`;

    blockDiv.appendChild(hourSpan);
    blockDiv.appendChild(priceSpan);
    fragment.appendChild(blockDiv);
  }

  // Single DOM operation
  table_grid.appendChild(fragment);
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
  const container_table_left = document.querySelector(
    '.container-table-price-left'
  );
  const container_table_right = document.querySelector(
    '.container-table-price-right'
  );

  if (container_table_left) container_table_left.innerHTML = '';
  if (container_table_right) container_table_right.innerHTML = '';
}

export function remove_tables_tomorrow() {
  // Optimized: Use innerHTML = '' instead of removeChild loops
  const container_table_left = document.querySelector(
    '.table-next-day-grid-left'
  );
  const container_table_right = document.querySelector(
    '.table-next-day-grid-right'
  );

  if (container_table_left) container_table_left.innerHTML = '';
  if (container_table_right) container_table_right.innerHTML = '';
}

export function table_price(data_hours, element) {
  const container = document.querySelector(element);
  if (!container) return;

  const get_value_checkbox_hours =
    document.getElementById('checkbox-hours').checked;

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

  // Use DocumentFragment for better performance
  const fragment = document.createDocumentFragment();

  for (let elements of data_hours) {
    const { price, hour, zone, hourHasPassed, tramo } = elements;
    const transform_hour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    const hour_has_passed_class =
      hourHasPassed && get_value_checkbox_hours ? 'element-hour-disabled' : '';

    // Create DOM elements instead of innerHTML for better performance
    const blockDiv = document.createElement('div');
    blockDiv.className = `${hour_has_passed_class} container-table-price-element`;

    const hourSpan = document.createElement('span');
    hourSpan.className = `container-table-price-element-hour tramo-hidden ${zone} tramo-${tramo}`;
    hourSpan.textContent = transform_hour;

    const priceSpan = document.createElement('span');
    priceSpan.className = 'container-table-price-element-price';
    priceSpan.textContent = `${price} € kWh`;

    blockDiv.appendChild(hourSpan);
    blockDiv.appendChild(priceSpan);
    fragment.appendChild(blockDiv);
  }

  // Single DOM operation
  container.appendChild(fragment);
}
