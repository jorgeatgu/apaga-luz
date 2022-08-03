import './../styles/styles.css';
import data_gas_omie from '/public/data/omie_compensacion_data.json';
import { table_price_tomorrow, remove_tables_tomorrow } from './table.js';

/*
Prices are published at 20:15,
at 20:30 I publish the next day's data,
this table will only be available until 00:00.
*/

let filter_data_tomorrow_omie = data_gas_omie.filter(({ price }) => price);
const data_source_element = document.getElementById('table-next-day-data');

filter_data_tomorrow_omie = filter_data_tomorrow_omie.sort(
  ({ price: a }, { price: b }) => a - b
);

const container_table_tomorrow = document.querySelector('.table-next-day');
filter_data_tomorrow_omie = filter_data_tomorrow_omie.map(
  ({ price, ...rest }) => {
    return {
      price: price.toFixed(3),
      ...rest
    };
  }
);

for (let [index, element] of filter_data_tomorrow_omie.entries()) {
  if (index < 8) {
    element.zone = 'valle';
  } else if (index >= 8 && index < 16) {
    element.zone = 'llano';
  } else {
    element.zone = 'punta';
  }
}

order_table_tomorrow_by_price();

function order_table_tomorrow_by_price() {
  filter_data_tomorrow_omie = filter_data_tomorrow_omie.sort(
    ({ price: a }, { price: b }) => a - b
  );

  table_price_tomorrow(
    filter_data_tomorrow_omie.slice(0, 12),
    '.table-next-day-grid-left',
    true
  );
  table_price_tomorrow(
    filter_data_tomorrow_omie.slice(12, 24),
    '.table-next-day-grid-right',
    true
  );
}

function order_table_tomorrow_by_hour() {
  filter_data_tomorrow_omie = filter_data_tomorrow_omie.sort(
    ({ hour: a }, { hour: b }) => a - b
  );
  table_price_tomorrow(
    filter_data_tomorrow_omie.slice(0, 12),
    '.table-next-day-grid-left',
    true
  );
  table_price_tomorrow(
    filter_data_tomorrow_omie.slice(12, 24),
    '.table-next-day-grid-right',
    true
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
