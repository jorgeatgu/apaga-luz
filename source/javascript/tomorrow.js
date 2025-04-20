import './../styles/styles.css';
import data_tomorrow from '/public/data/tomorrow_price.json';
import data_tomorrow_omie from '/public/data/omie_data.json';
import { table_price_tomorrow, remove_tables_tomorrow } from './table.js';
import { is_week_end } from './utils.js';

/*
Prices are published at 20:15,
at 20:30 I publish the next day's data,
this table will only be available until 00:00.
*/

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};
const formattedDate = tomorrow.toLocaleDateString('es-ES', options);

// Actualizar todos los elementos que muestran la fecha
document.querySelectorAll('.tomorrow-date').forEach(element => {
  element.textContent = formattedDate;
});

// Actualizar timestamp de última actualización
const now = new Date();
const hours = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
document.querySelectorAll('.last-update-time').forEach(element => {
  element.textContent = `${hours}:${minutes}`;
});

let user_hour = new Date().getHours();
let user_minutes = new Date().getMinutes();
user_hour = user_hour < 10 ? `0${user_hour}` : user_hour;
user_minutes = user_minutes < 10 ? `0${user_minutes}` : user_minutes;
const EIGHT_TWENTY = 1220;
const QUARTER_PAST_ONE = 790;

const get_day_from_data_omie = +data_tomorrow_omie[0].day;
const get_month_from_data_omie = +data_tomorrow_omie[0].month;
const get_day_from_data_esios = +data_tomorrow[0].day.split('/')[0];
const get_month_from_data_esios = +data_tomorrow[0].day.split('/')[1];

const its_time_to_show_the_data_from_esios =
  user_hour * 60 + +user_minutes >= EIGHT_TWENTY && user_hour < 24;
const its_time_to_show_the_content =
  user_hour * 60 + +user_minutes >= QUARTER_PAST_ONE && user_hour < 24;

const get_day_from_data = its_time_to_show_the_data_from_esios
  ? get_day_from_data_esios
  : get_day_from_data_omie;
const get_month_from_data = its_time_to_show_the_data_from_esios
  ? get_month_from_data_esios
  : get_month_from_data_omie;

const check_the_day_in_data =
  get_day_from_data === tomorrow.getDate() &&
  get_month_from_data === tomorrow.getMonth() + 1;

let filter_data_tomorrow_omie = data_tomorrow_omie.filter(({ price }) => price);

let filter_data_tomorrow = its_time_to_show_the_data_from_esios
  ? data_tomorrow
  : filter_data_tomorrow_omie;

const data_source_element = document.getElementById('table-next-day-data');
const data_source = its_time_to_show_the_data_from_esios ? 'ESIOS' : 'OMIE';

filter_data_tomorrow = filter_data_tomorrow.sort(
  ({ price: a }, { price: b }) => a - b
);

const container_table_tomorrow = document.querySelector('.table-next-day');
filter_data_tomorrow = filter_data_tomorrow.map(({ price, ...rest }) => {
  return {
    price: price.toFixed(3),
    ...rest
  };
});

for (let [index, element] of filter_data_tomorrow.entries()) {
  if (index < 8) {
    element.zone = 'valle';
  } else if (index >= 8 && index < 16) {
    element.zone = 'llano';
  } else {
    element.zone = 'punta';
  }

  if (element.hour >= 0 && element.hour < 8 && !is_week_end(tomorrow)) {
    element.tramo = 'valle';
  } else if (
    (element.hour >= 8 && element.hour < 10 && !is_week_end(tomorrow)) ||
    (element.hour >= 14 && element.hour < 18 && !is_week_end(tomorrow)) ||
    (element.hour >= 22 && element.hour < 24 && !is_week_end(tomorrow))
  ) {
    element.tramo = 'llano';
  } else {
    element.tramo = 'punta';
  }

  if (is_week_end(tomorrow)) {
    element.tramo = 'valle';
  }
}

order_table_tomorrow_by_price();
if (its_time_to_show_the_content && check_the_day_in_data) {
  container_table_tomorrow.style.display = 'grid';
  data_source_element.textContent = `Los datos de los precios son de la subasta de: ${data_source}`;
  data_source_element.style.display = 'block';
} else {
  const get_warning_id = document.getElementById('warning-tomorrow-data');
  get_warning_id.textContent = `Todavía no hay datos disponibles para el precio de la luz mañana: ${tomorrow.toLocaleDateString(
    'es-ES',
    options
  )}`;
  container_table_tomorrow.style.display = 'none';
}

function order_table_tomorrow_by_price() {
  filter_data_tomorrow = filter_data_tomorrow.sort(
    ({ price: a }, { price: b }) => a - b
  );

  table_price_tomorrow(
    filter_data_tomorrow.slice(0, 12),
    '.table-next-day-grid-left'
  );
  table_price_tomorrow(
    filter_data_tomorrow.slice(12, 24),
    '.table-next-day-grid-right'
  );
}

function order_table_tomorrow_by_hour() {
  filter_data_tomorrow = filter_data_tomorrow.sort(
    ({ hour: a }, { hour: b }) => a - b
  );
  table_price_tomorrow(
    filter_data_tomorrow.slice(0, 12),
    '.table-next-day-grid-left'
  );
  table_price_tomorrow(
    filter_data_tomorrow.slice(12, 24),
    '.table-next-day-grid-right'
  );
}

document.getElementById('order-price-next').addEventListener('click', () => {
  remove_tables_tomorrow();
  order_table_tomorrow_by_price();
});

document.getElementById('order-hour-next').addEventListener('click', () => {
  remove_tables_tomorrow();
  order_table_tomorrow_by_hour();
});

const text_whatsApp = `whatsapp://send?text=Aquí puedes consultar el precio de la luz de mañana ${tomorrow.toLocaleDateString(
  'es-ES',
  options
)} https://www.apaga-luz.com/precio-luz-manana/?utm_source=whatsapp_mnn`;
const button_whatsApp = document.getElementById('btn-whatsapp-manana');
button_whatsApp.href = text_whatsApp;

document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const header = document.querySelector('.site-header');

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      header.classList.toggle('menu-open');
      const isExpanded = header.classList.contains('menu-open');
      this.setAttribute('aria-expanded', isExpanded);

      if (isExpanded) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      if (window.innerWidth < 992) {
        e.preventDefault();
        const parent = this.closest('.has-dropdown');
        parent.classList.toggle('open');
      }
    });
  });

  const navLinks = document.querySelectorAll(
    '.nav-link:not(.dropdown-toggle), .dropdown-item'
  );

  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      if (window.innerWidth < 992) {
        header.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 992) {
      header.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';

      document.querySelectorAll('.has-dropdown.open').forEach(item => {
        item.classList.remove('open');
      });
    }
  });
});
