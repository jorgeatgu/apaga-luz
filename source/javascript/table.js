export function createNewTable(dataTable, selector, type_of_filter) {
  dataTable.forEach(element => {
    element.dia = `${element.dia.split('/')[1]}/${element.dia.split('/')[0]}/${
      element.dia.split('/')[2]
    }`;
  });

  const data = dataTable.sort((a, b) => new Date(a.dia) - new Date(b.dia));

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

  //Se aplica un map para parsear las fechas
  //y dejar solamente el año para el header
  array_of_dates.map((day, index) => {
    if (day === 'Hora') {
      header.insertCell(index).innerText = day;
    }
    if (day !== 'Hora' && type_of_filter === 'day') {
      const day_month_year = `${day.split('/')[1]}/${day.split('/')[0]}/${
        day.split('/')[2]
      }`;
      header.insertCell(index).innerText = day_month_year;
    }
    if (day !== 'Hora' && type_of_filter === 'year') {
      let parse_date = new Date(day);
      header.insertCell(index).innerText = parse_date.getFullYear();
    }
  });

  const body = document.createElement('tbody');
  body.classList.add('tbody-same-day');
  table.appendChild(body);

  //Array con las horas del día,
  //para poder crear un row por hora
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

    data_filter_hours.map(({ precio }, index) => {
      const new_cell = row.insertCell(index + 1);
      new_cell.innerText = `${(precio / 1000).toFixed(3)} €`;
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

  function sortDirectionIcon(asc, target) {
    document
      .querySelectorAll(`#${selector} table .header-same-day td`)
      .forEach(th => th.classList.remove('sorted-down', 'sorted-up'));
    if (asc) {
      target.classList.remove('sorted-down');
      target.classList.add('sorted-up');
    } else {
      target.classList.remove('sorted-up');
      target.classList.add('sorted-down');
    }
  }
}
