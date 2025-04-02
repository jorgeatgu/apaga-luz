document.addEventListener('DOMContentLoaded', function () {
  let readingTimeEvents = {
    '30s': false,
    '60s': false,
    '120s': false,
    '300s': false
  };

  setTimeout(() => {
    if (!readingTimeEvents['30s']) {
      gtag('event', 'reading_time', { time_threshold: '30_seconds' });
      readingTimeEvents['30s'] = true;
    }
  }, 30000);

  setTimeout(() => {
    if (!readingTimeEvents['60s']) {
      gtag('event', 'reading_time', { time_threshold: '1_minute' });
      readingTimeEvents['60s'] = true;
    }
  }, 60000);

  setTimeout(() => {
    if (!readingTimeEvents['120s']) {
      gtag('event', 'reading_time', { time_threshold: '2_minutes' });
      readingTimeEvents['120s'] = true;
    }
  }, 120000);

  setTimeout(() => {
    if (!readingTimeEvents['300s']) {
      gtag('event', 'reading_time', { time_threshold: '5_minutes' });
      readingTimeEvents['300s'] = true;

      const pageContent = document.body.textContent.toLowerCase();
      if (pageContent.includes('ahorr') || pageContent.includes('barato')) {
        gtag('set', 'user_properties', {
          interest_savings: 'high'
        });
      }
    }
  }, 300000);

  document.querySelectorAll('.cta, .button, .btn').forEach(button => {
    button.addEventListener('click', function () {
      gtag('event', 'cta_click', {
        cta_text: this.textContent.trim(),
        cta_location: 'content_page'
      });
    });
  });

  document.addEventListener('copy', function () {
    gtag('event', 'content_copy', {
      page_path: window.location.pathname
    });
  });
});
