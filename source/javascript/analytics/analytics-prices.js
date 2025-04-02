
document.addEventListener('DOMContentLoaded', function() {
  const pageContent = document.body.textContent.toLowerCase();
  let tariffType = 'other';

  if (pageContent.includes('discriminación horaria') || pageContent.includes('discriminacion horaria')) {
    tariffType = 'discriminacion_horaria';
    gtag('set', 'user_properties', {
      'tariff_type_preference': tariffType
    });
  } else if (pageContent.includes('tarifa valle') || pageContent.includes('hora valle')) {
    tariffType = 'tarifa_valle';
    gtag('set', 'user_properties', {
      'tariff_type_preference': tariffType
    });
  } else if (pageContent.includes('tarifa fija') || pageContent.includes('precio fijo')) {
    tariffType = 'tarifa_fija';
    gtag('set', 'user_properties', {
      'tariff_type_preference': tariffType
    });
  }

  const timeSelectors = document.querySelectorAll('.time-period-selector, .hour-selector, [data-period]');
  if (timeSelectors.length > 0) {
    timeSelectors.forEach(selector => {
      selector.addEventListener('click', function() {
        let timeSegment = this.dataset.period || this.textContent.trim().toLowerCase();

        if (timeSegment.includes('mañana')) timeSegment = 'morning';
        else if (timeSegment.includes('tarde')) timeSegment = 'afternoon';
        else if (timeSegment.includes('noche')) timeSegment = 'night';

        let dateValue = 'today';
        const dateSelector = document.querySelector('.date-selector, [type="date"]');
        if (dateSelector) {
          dateValue = dateSelector.value || 'today';
        }

        gtag('event', 'price_check', {
          'time_period': timeSegment,
          'date_checked': dateValue
        });

        if (timeSegment === 'night') {
          gtag('set', 'user_properties', {
            'tariff_type_preference': 'tarifa_valle'
          });
        }
      });
    });
  }

  const priceTableHeaders = document.querySelectorAll('table th, .price-table th, .tariff-table th');
  if (priceTableHeaders.length > 0) {
    priceTableHeaders.forEach(header => {
      header.addEventListener('click', function() {
        gtag('event', 'price_table_interaction', {
          'interaction_type': 'sort',
          'column_name': this.textContent.trim()
        });
      });
    });
  }

  const tableFilters = document.querySelectorAll('.table-filter, select, [data-filter]');
  if (tableFilters.length > 0) {
    tableFilters.forEach(filter => {
      filter.addEventListener('change', function() {
        gtag('event', 'price_table_interaction', {
          'interaction_type': 'filter',
          'filter_type': this.name || this.id || 'unknown',
          'filter_value': this.value
        });
      });
    });
  }
});
