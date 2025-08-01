import './../styles/styles.css';
import {
  reload_page,
  get_zone_color,
  width_mobile,
  day_names_us,
  is_week_end
} from './utils.js';

import {
  table_price,
  table_price_tomorrow,
  remove_tables,
  remove_tables_tomorrow
} from './table.js';

// Performance-optimized main application
class ApagaLuzApp {
  constructor() {
    this.dataToday = null;
    this.dataCanary = null;
    this.tomorrowData = null;
    this.tomorrowOmieData = null;
    this.filterDataToday = null;
    this.filterDataTomorrow = null;
    this.typeOfOrder = 'hour';
    this.priceCalculationsCache = new Map();
    this.debounceTimers = new Map();

    this.init();
  }

  async init() {
    await this.loadInitialData();
    this.setupUI();
    this.bindEvents();
  }

  async loadInitialData() {
    try {
      const [todayResponse, canaryResponse] = await Promise.all([
        fetch('/data/today_price.json'),
        fetch('/data/canary_price.json')
      ]);

      this.dataToday = await todayResponse.json();
      this.dataCanary = await canaryResponse.json();

      this.processInitialData();
    } catch (error) {
      console.warn('Failed to load initial data:', error);
    }
  }

  processInitialData() {
    const userHour = new Date().getHours();
    const userMinutes = new Date().getMinutes();
    const userDay = new Date();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Determine data source
    const isUserFromCanary =
      timeZone === 'Atlantic/Canary' && userHour > 22 && userHour < 24;
    const dataPrices = isUserFromCanary ? this.dataCanary : this.dataToday;

    if (!dataPrices || dataPrices.length === 0) return;

    // Find current price
    const currentPriceData = dataPrices.find(({ hour }) => +hour === userHour);
    if (!currentPriceData) return;

    // Update UI elements
    this.updateTimeDisplay(userHour, userMinutes);
    this.updatePriceDisplay(currentPriceData.price);

    // Process data for tables
    this.filterDataToday = this.processHourlyData(
      dataPrices,
      userHour,
      userDay
    );

    // Set background color based on current hour zone
    this.setBackgroundColor(userHour);

    // Initialize tables
    this.orderByHour();

    // Setup price statistics
    this.displayPriceStatistics();

    // Setup WhatsApp sharing
    this.setupWhatsAppSharing(
      userHour,
      userMinutes,
      currentPriceData.price,
      userDay
    );

    // Setup page reload
    reload_page(userMinutes);

    // Setup tomorrow data if needed
    this.initializeTomorrowDataIfNeeded(userHour, userMinutes);
  }

  processHourlyData(data, userHour, userDay) {
    const processed = data
      .map(({ hour, price, ...rest }) => ({
        hourHasPassed: +hour < userHour,
        price: price.toFixed(3),
        hour,
        ...rest
      }))
      .sort(({ price: a }, { price: b }) => a - b);

    // Add zone and tramo information
    processed.forEach((element, index) => {
      // Zone based on price ranking
      if (index < 8) {
        element.zone = 'valle';
      } else if (index >= 8 && index < 16) {
        element.zone = 'llano';
      } else {
        element.zone = 'punta';
      }

      // Tramo based on time slots
      if (element.hour >= 0 && element.hour < 8 && !is_week_end(userDay)) {
        element.tramo = 'valle';
      } else if (
        (element.hour >= 8 && element.hour < 10 && !is_week_end(userDay)) ||
        (element.hour >= 14 && element.hour < 18 && !is_week_end(userDay)) ||
        (element.hour >= 22 && element.hour < 24 && !is_week_end(userDay))
      ) {
        element.tramo = 'llano';
      } else {
        element.tramo = 'punta';
      }

      if (is_week_end(userDay)) {
        element.tramo = 'valle';
      }
    });

    return processed;
  }

  updateTimeDisplay(hour, minutes) {
    const formattedHour = hour < 10 ? `0${hour}` : hour;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');

    if (hoursElement) hoursElement.textContent = formattedHour;
    if (minutesElement) minutesElement.textContent = formattedMinutes;
  }

  updatePriceDisplay(price) {
    const priceElement = document.getElementById('price');
    if (priceElement) priceElement.textContent = price.toFixed(3);
  }

  setBackgroundColor(userHour) {
    const currentHourData = this.filterDataToday.find(
      ({ hour }) => hour === userHour
    );
    const mainElement = document.body;

    if (currentHourData && mainElement) {
      mainElement.style.backgroundColor = get_zone_color(currentHourData.zone);
    }
  }

  calculatePriceStats(data) {
    const cacheKey = data.map(item => `${item.hour}-${item.price}`).join('|');

    if (this.priceCalculationsCache.has(cacheKey)) {
      return this.priceCalculationsCache.get(cacheKey);
    }

    const sortedData = data
      .map(({ price, ...rest }) => ({
        price: Number(price),
        ...rest
      }))
      .sort(({ price: a }, { price: b }) => b - a);

    const max_price = sortedData[0];
    const min_price = sortedData[sortedData.length - 1];
    const prices = sortedData.map(({ price }) => price);
    const avg_price = prices.reduce((a, b) => a + b, 0) / prices.length;

    const result = { max_price, min_price, avg_price };

    this.priceCalculationsCache.set(cacheKey, result);

    // Limit cache size
    if (this.priceCalculationsCache.size > 10) {
      const firstKey = this.priceCalculationsCache.keys().next().value;
      this.priceCalculationsCache.delete(firstKey);
    }

    return result;
  }

  displayPriceStatistics() {
    const { max_price, min_price, avg_price } = this.calculatePriceStats(
      this.filterDataToday
    );

    const templates = [
      {
        id: 'contanier-avg-price',
        content: `<span>El precio medio del día</span> <span class="container-max-min-avg-number">${avg_price.toFixed(
          3
        )} €/kWh</span>`
      },
      {
        id: 'contanier-min-price',
        content: `<span>La hora más barata</span> <span class="container-max-min-avg-number">${
          min_price.hour
        }:00 - ${min_price.price.toFixed(3)} €/kWh</span>`
      },
      {
        id: 'contanier-max-price',
        content: `<span>La hora más cara</span> <span class="container-max-min-avg-number">${
          max_price.hour
        }:00 - ${max_price.price.toFixed(3)} €/kWh</span>`
      }
    ];

    requestAnimationFrame(() => {
      templates.forEach(({ id, content }) => {
        const element = document.getElementById(id);
        if (element) {
          element.insertAdjacentHTML('beforeend', content);
        }
      });
    });
  }

  setupWhatsAppSharing(hour, minutes, price, day) {
    const formattedHour = hour < 10 ? `0${hour}` : hour;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    const { max_price, min_price, avg_price } = this.calculatePriceStats(
      this.filterDataToday
    );

    const options = { weekday: 'long', month: 'long', day: 'numeric' };

    const textWhatsApp = `whatsapp://send?text=El precio de la luz a las ${formattedHour}:${formattedMinutes} es de ${price.toFixed(
      3
    )} €/kWh https://www.apaga-luz.com/?utm_source=whatsapp`;
    const textWhatsAppAvg = `whatsapp://send?text=👉🏻 Para el ${day.toLocaleDateString(
      'es-ES',
      options
    )}:%0a💡 El precio medio de la luz es de ${avg_price.toFixed(
      3
    )} €/kWh %0a✅ La hora más barata es a las ${
      min_price.hour
    }:00 - ${min_price.price.toFixed(
      3
    )} €/kWh %0a🚨 La hora más cara es a las ${
      max_price.hour
    }:00 - ${max_price.price.toFixed(
      3
    )} €/kWh %0ahttps://www.apaga-luz.com/?utm_source=whatsapp_avg`;

    const buttonWhatsApp = document.getElementById('btn-whatsapp');
    const buttonWhatsAppAvg = document.getElementById('btn-whatsapp-avg');

    if (buttonWhatsApp) buttonWhatsApp.href = textWhatsApp;
    if (buttonWhatsAppAvg) buttonWhatsAppAvg.href = textWhatsAppAvg;
  }

  debounce(func, delay, key = 'default') {
    return (...args) => {
      clearTimeout(this.debounceTimers.get(key));
      this.debounceTimers.set(
        key,
        setTimeout(() => func.apply(this, args), delay)
      );
    };
  }

  orderByPrice() {
    this.filterDataToday = this.filterDataToday.sort(
      ({ price: a }, { price: b }) => a - b
    );
    table_price(
      this.filterDataToday.slice(0, 12),
      '.container-table-price-left'
    );
    table_price(
      this.filterDataToday.slice(12, 24),
      '.container-table-price-right'
    );
    this.typeOfOrder = 'price';
  }

  orderByHour() {
    this.filterDataToday = this.filterDataToday.sort(
      ({ hour: a }, { hour: b }) => a - b
    );
    table_price(
      this.filterDataToday.slice(0, 12),
      '.container-table-price-left'
    );
    table_price(
      this.filterDataToday.slice(12, 24),
      '.container-table-price-right'
    );
    this.typeOfOrder = 'hour';
  }

  async initializeTomorrowDataIfNeeded(userHour, userMinutes) {
    const TWENTY_PAST_EIGHT_MINUTES = 1220;
    const QUARTER_PAST_ONE = 790;
    const currentMinutes = userHour * 60 + userMinutes;

    // Separate time conditions for OMIE and ESIOS data
    const isTimeForOmieData =
      currentMinutes >= QUARTER_PAST_ONE &&
      currentMinutes < TWENTY_PAST_EIGHT_MINUTES;

    const isTimeForEsiosData =
      currentMinutes >= TWENTY_PAST_EIGHT_MINUTES && userHour < 24;

    // Only load data if it's the right time
    if (isTimeForOmieData || isTimeForEsiosData) {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() =>
          this.loadTomorrowData(isTimeForOmieData, isTimeForEsiosData)
        );
      } else {
        setTimeout(
          () => this.loadTomorrowData(isTimeForOmieData, isTimeForEsiosData),
          100
        );
      }
    }
  }

  async loadTomorrowData(isTimeForOmieData, isTimeForEsiosData) {
    if (this.tomorrowData && this.tomorrowOmieData) {
      // Data already loaded, just process for display
      this.processTomorrowData(isTimeForOmieData, isTimeForEsiosData);
      return;
    }

    try {
      const [omieResponse, tomorrowResponse] = await Promise.all([
        fetch('/data/omie_data.json'),
        fetch('/data/tomorrow_price.json')
      ]);

      this.tomorrowOmieData = await omieResponse.json();
      this.tomorrowData = await tomorrowResponse.json();

      this.processTomorrowData(isTimeForOmieData, isTimeForEsiosData);
    } catch (error) {
      console.warn('Failed to load tomorrow data:', error);
    }
  }

  processTomorrowData(isTimeForOmieData, isTimeForEsiosData) {
    if (!this.tomorrowData || !this.tomorrowOmieData) {
      console.warn('Tomorrow data not available yet');
      return;
    }

    // Check if we have valid data with dates
    if (!this.tomorrowOmieData[0] || !this.tomorrowData[0]) {
      console.warn('Tomorrow data structure is invalid');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Date validations
    const getDayFromDataOmie = +this.tomorrowOmieData[0].day;
    const getMonthFromDataOmie = +this.tomorrowOmieData[0].month;
    const getDayFromDataEsios = +this.tomorrowData[0].day.split('/')[0];
    const getMonthFromDataEsios = +this.tomorrowData[0].day.split('/')[1];

    const checkTheDayInDataOmie =
      getDayFromDataOmie === tomorrow.getDate() &&
      getMonthFromDataOmie === tomorrow.getMonth() + 1;

    const itsTheRightDay =
      getDayFromDataEsios === tomorrow.getDate() &&
      getMonthFromDataEsios === tomorrow.getMonth() + 1;

    // Show OMIE button if conditions are met
    const getButtonNextDay = document.getElementById('button-prices-next-day');
    if (getButtonNextDay) {
      if (isTimeForOmieData && checkTheDayInDataOmie) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        getButtonNextDay.style.display = 'inline-block';
        getButtonNextDay.textContent = `Precios de la luz por horas para: ${tomorrow.toLocaleDateString(
          'es-ES',
          options
        )}`;
      } else {
        getButtonNextDay.style.display = 'none';
      }
    }

    // Show ESIOS table if conditions are met
    const containerTableTomorrow = document.querySelector('.table-next-day');
    if (containerTableTomorrow) {
      if (isTimeForEsiosData && itsTheRightDay) {
        // Process the data for display
        this.filterDataTomorrow = this.tomorrowData
          .sort(({ price: a }, { price: b }) => a - b)
          .map(({ price, ...rest }) => ({
            price: price.toFixed(3),
            ...rest
          }));

        // Add zone and tramo information
        this.filterDataTomorrow.forEach((element, index) => {
          // Zone based on price ranking
          if (index < 8) {
            element.zone = 'valle';
          } else if (index >= 8 && index < 16) {
            element.zone = 'llano';
          } else {
            element.zone = 'punta';
          }

          // Tramo based on time slots
          if (element.hour >= 0 && element.hour < 8 && !is_week_end(tomorrow)) {
            element.tramo = 'valle';
          } else if (
            (element.hour >= 8 &&
              element.hour < 10 &&
              !is_week_end(tomorrow)) ||
            (element.hour >= 14 &&
              element.hour < 18 &&
              !is_week_end(tomorrow)) ||
            (element.hour >= 22 && element.hour < 24 && !is_week_end(tomorrow))
          ) {
            element.tramo = 'llano';
          } else {
            element.tramo = 'punta';
          }

          if (is_week_end(tomorrow)) {
            element.tramo = 'valle';
          }
        });

        containerTableTomorrow.style.display = 'block';
        this.orderTableTomorrowByPrice();
      } else {
        containerTableTomorrow.style.display = 'none';
      }
    }

    // Debug log to help troubleshoot
    console.log('Tomorrow data conditions:', {
      isTimeForOmieData,
      isTimeForEsiosData,
      checkTheDayInDataOmie,
      itsTheRightDay,
      currentTime: `${new Date().getHours()}:${new Date().getMinutes()}`
    });
  }

  setupUI() {
    // Reserve space for dynamic elements to prevent layout shifts
    const containerTable = document.querySelector('.container-wrapper');
    if (containerTable) {
      containerTable.style.minHeight = '600px';
    }

    const charts = document.querySelectorAll('.charts');
    charts.forEach(chart => {
      chart.style.minHeight = '500px';
    });

    // Initialize tomorrow's elements as hidden by default
    const containerTableTomorrow = document.querySelector('.table-next-day');
    if (containerTableTomorrow) {
      containerTableTomorrow.style.display = 'none';
    }

    const getButtonNextDay = document.getElementById('button-prices-next-day');
    if (getButtonNextDay) {
      getButtonNextDay.style.display = 'none';
    }
  }

  bindEvents() {
    // Debounced event handlers
    const debouncedOrderByPrice = this.debounce(
      () => {
        requestAnimationFrame(() => {
          remove_tables();
          this.orderByPrice();
        });
      },
      200,
      'orderPrice'
    );

    const debouncedOrderByHour = this.debounce(
      () => {
        requestAnimationFrame(() => {
          remove_tables();
          this.orderByHour();
        });
      },
      200,
      'orderHour'
    );

    const debouncedCheckboxChange = this.debounce(
      () => {
        requestAnimationFrame(() => {
          if (this.typeOfOrder === 'price') {
            remove_tables();
            this.orderByPrice();
          } else {
            remove_tables();
            this.orderByHour();
          }
        });
      },
      100,
      'checkbox'
    );

    // Bind events
    const orderPriceBtn = document.getElementById('order-price');
    const orderHourBtn = document.getElementById('order-hour');
    const checkboxHours = document.getElementById('checkbox-hours');

    if (orderPriceBtn)
      orderPriceBtn.addEventListener('click', debouncedOrderByPrice);
    if (orderHourBtn)
      orderHourBtn.addEventListener('click', debouncedOrderByHour);
    if (checkboxHours)
      checkboxHours.addEventListener('change', debouncedCheckboxChange);

    // Color blindness and tramos toggles
    this.setupToggleEvents();

    // Setup tomorrow data handlers
    this.setupTomorrowHandlers();
  }

  setupToggleEvents() {
    const colorBlindnessToggle = document.getElementById('color-blindness');
    const tramosToggle = document.getElementById('tramos');
    const root = document.documentElement;

    if (colorBlindnessToggle) {
      colorBlindnessToggle.addEventListener('change', e => {
        const { checked } = e.target;
        if (checked) {
          root.style.setProperty('--orange-light', 'rgb(255, 176, 0)');
          root.style.setProperty('--green-light', 'rgb(100, 143, 255)');
          root.style.setProperty('--red-light', 'rgb(220, 38, 127)');
        } else {
          root.style.setProperty('--orange-light', '#ffae3ab3');
          root.style.setProperty('--green-light', '#a2fcc1b3');
          root.style.setProperty('--red-light', '#ec1d2fb3');
        }
      });
    }

    if (tramosToggle) {
      tramosToggle.addEventListener('change', e => {
        const { checked } = e.target;
        const priceElements = document.querySelectorAll(
          '.container-table-price-element-hour'
        );

        requestAnimationFrame(() => {
          priceElements.forEach(element => {
            if (checked) {
              element.classList.remove('tramo-hidden');
            } else {
              element.classList.add('tramo-hidden');
            }
          });
        });
      });
    }
  }

  setupTomorrowHandlers() {
    // Debounced handlers for tomorrow's data
    const debouncedOrderTomorrowByPrice = this.debounce(
      () => {
        requestAnimationFrame(() => {
          remove_tables_tomorrow();
          this.orderTableTomorrowByPrice();
        });
      },
      200,
      'orderTomorrowPrice'
    );

    const debouncedOrderTomorrowByHour = this.debounce(
      () => {
        requestAnimationFrame(() => {
          remove_tables_tomorrow();
          this.orderTableTomorrowByHour();
        });
      },
      200,
      'orderTomorrowHour'
    );

    const orderPriceNextBtn = document.getElementById('order-price-next');
    const orderHourNextBtn = document.getElementById('order-hour-next');

    if (orderPriceNextBtn)
      orderPriceNextBtn.addEventListener(
        'click',
        debouncedOrderTomorrowByPrice
      );
    if (orderHourNextBtn)
      orderHourNextBtn.addEventListener('click', debouncedOrderTomorrowByHour);
  }

  orderTableTomorrowByPrice() {
    if (!this.filterDataTomorrow) return;

    this.filterDataTomorrow = this.filterDataTomorrow.sort(
      ({ price: a }, { price: b }) => a - b
    );

    table_price_tomorrow(
      this.filterDataTomorrow.slice(0, 12),
      '.table-next-day-grid-left'
    );
    table_price_tomorrow(
      this.filterDataTomorrow.slice(12, 24),
      '.table-next-day-grid-right'
    );
  }

  orderTableTomorrowByHour() {
    if (!this.filterDataTomorrow) return;

    this.filterDataTomorrow = this.filterDataTomorrow.sort(
      ({ hour: a }, { hour: b }) => a - b
    );
    table_price_tomorrow(
      this.filterDataTomorrow.slice(0, 12),
      '.table-next-day-grid-left'
    );
    table_price_tomorrow(
      this.filterDataTomorrow.slice(12, 24),
      '.table-next-day-grid-right'
    );
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  // All-in-one initialization
  const elements = {
    body: document.body,
    menuToggle: document.querySelector('.menu-toggle'),
    header: document.querySelector('.site-header'),
    fileInput: document.getElementById('fc-generated-1-single-file'),
    fileInfo: document.getElementById('file-info'),
    fileContainer: document.querySelector('.form-file-container'),
    form: document.getElementById('formulario-ahorro'),
    dropdownToggles: document.querySelectorAll('.dropdown-toggle'),
    navLinks: document.querySelectorAll(
      '.nav-link:not(.dropdown-toggle), .dropdown-item'
    )
  };

  // Initialize page components
  initializePageComponents(elements);
  setupFormHandling(
    elements.form,
    elements.fileInput,
    elements.fileInfo,
    elements.fileContainer
  );
  setupMenuNavigation(
    elements.menuToggle,
    elements.header,
    elements.dropdownToggles,
    elements.navLinks
  );
  injectFormStyles();

  // Initialize main app
  new ApagaLuzApp();
});

// Helper functions (moved from previous implementation)
function initializePageComponents(elements) {
  // Optimized body padding reset
  let paddingResetTimer = null;

  function resetBodyPaddingIfNeeded() {
    if (paddingResetTimer) return;

    paddingResetTimer = setTimeout(() => {
      if (elements.body.style.padding) {
        elements.body.style.padding = '';
      }
      paddingResetTimer = null;
    }, 100);
  }

  window.addEventListener('load', resetBodyPaddingIfNeeded);
  setInterval(resetBodyPaddingIfNeeded, 5000);

  // Load ads with reduced impact
  if (window.adsbygoogle && window.adsbygoogle.length === 0) {
    window.addEventListener('load', function () {
      setTimeout(() => {
        (adsbygoogle = window.adsbygoogle || []).push({});
      }, 1000);
    });
  }
}

function setupFormHandling(form, fileInput, fileInfo, fileContainer) {
  if (fileInput && fileInfo) {
    fileInput.addEventListener('change', function () {
      requestAnimationFrame(() => {
        if (this.files && this.files[0]) {
          const fileName = this.files[0].name;
          fileInfo.innerHTML = `<span style="color: #ec7f00; font-weight: 600;">✓ Archivo seleccionado:</span> ${fileName}`;
          fileContainer.style.borderColor = '#a2fcc1';
          fileContainer.style.backgroundColor = 'rgba(162, 252, 193, 0.1)';
        } else {
          fileInfo.textContent = 'No se ha seleccionado ningún archivo.';
          fileContainer.style.borderColor = 'rgba(236, 127, 0, 0.3)';
          fileContainer.style.backgroundColor = 'rgba(236, 127, 0, 0.05)';
        }
      });
    });

    if (fileContainer) {
      fileContainer.addEventListener('click', function (e) {
        if (e.target !== fileInput) {
          fileInput.click();
        }
      });
    }
  }

  if (form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');

    inputs.forEach(input => {
      input.addEventListener('blur', function () {
        requestAnimationFrame(() => validateInput(this));
      });

      input.addEventListener('input', function () {
        if (this.value.trim() !== '') {
          requestAnimationFrame(() => clearInputError(this));
        }
      });
    });

    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
      emailInput.addEventListener('blur', function () {
        requestAnimationFrame(() => validateEmail(this));
      });
    }

    form.addEventListener('submit', function (e) {
      const submitButton = this.querySelector('.form-button');
      if (submitButton) {
        requestAnimationFrame(() => {
          submitButton.innerHTML =
            '<span class="form-button-text">Enviando...</span>';
          submitButton.disabled = true;
          submitButton.style.opacity = '0.8';
        });
      }
    });
  }
}

function validateInput(input) {
  if (input.value.trim() === '') {
    input.classList.add('form-input-error');
    let errorMsg = input.parentNode.querySelector('.form-error-message');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.className = 'form-error-message';
      errorMsg.textContent = 'Este campo es obligatorio';
      input.parentNode.appendChild(errorMsg);
    }
  } else {
    clearInputError(input);
  }
}

function clearInputError(input) {
  input.classList.remove('form-input-error');
  const errorMsg = input.parentNode.querySelector('.form-error-message');
  if (errorMsg) {
    errorMsg.remove();
  }
}

function validateEmail(emailInput) {
  const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (emailInput.value.trim() !== '' && !isValidEmail(emailInput.value)) {
    emailInput.classList.add('form-input-error');
    let errorMsg = emailInput.parentNode.querySelector('.form-error-message');
    if (!errorMsg) {
      errorMsg = document.createElement('div');
      errorMsg.className = 'form-error-message';
      errorMsg.textContent = 'Por favor, introduce un email válido';
      emailInput.parentNode.appendChild(errorMsg);
    } else {
      errorMsg.textContent = 'Por favor, introduce un email válido';
    }
  }
}

function setupMenuNavigation(menuToggle, header, dropdownToggles, navLinks) {
  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      requestAnimationFrame(() => {
        header.classList.toggle('menu-open');
        const isExpanded = header.classList.contains('menu-open');
        this.setAttribute('aria-expanded', isExpanded);
        document.body.style.overflow = isExpanded ? 'hidden' : '';
      });
    });
  }

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      if (window.innerWidth < 992) {
        e.preventDefault();
        requestAnimationFrame(() => {
          const parent = this.closest('.has-dropdown');
          parent.classList.toggle('open');
        });
      }
    });
  });

  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      if (window.innerWidth < 992) {
        requestAnimationFrame(() => {
          header.classList.remove('menu-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      }
    });
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 992) {
      requestAnimationFrame(() => {
        header.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        document.querySelectorAll('.has-dropdown.open').forEach(item => {
          item.classList.remove('open');
        });
      });
    }
  });
}

function injectFormStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .form-input-error {
      border-color: #ec1d2f !important;
      background-color: rgba(236, 29, 47, 0.05) !important;
    }
    .form-error-message {
      color: #ec1d2f;
      font-size: 0.8rem;
      margin-top: 0.25rem;
      animation: fadeIn 0.3s;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}
