document.addEventListener('DOMContentLoaded', function() {
  gtag('set', 'user_properties', {
    'device_preference': /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
  });

  const savedInterest = localStorage.getItem('interest_savings');
  const savedTariff = localStorage.getItem('tariff_type_preference');

  if (savedInterest) {
    gtag('set', 'user_properties', {
      'interest_savings': savedInterest
    });
  }

  if (savedTariff) {
    gtag('set', 'user_properties', {
      'tariff_type_preference': savedTariff
    });
  }

  const originalGtag = window.gtag;
  window.gtag = function() {
    if (arguments[0] === 'set' && arguments[1] === 'user_properties') {
      const properties = arguments[2];

      if (properties.interest_savings) {
        localStorage.setItem('interest_savings', properties.interest_savings);
      }

      if (properties.tariff_type_preference) {
        localStorage.setItem('tariff_type_preference', properties.tariff_type_preference);
      }
    }

    return originalGtag.apply(this, arguments);
  };

  let scrollDepthTriggered75 = false;
  let scrollDepthTriggered90 = false;

  window.addEventListener('scroll', function() {
    let scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;

    if (!scrollDepthTriggered75 && scrollPercentage > 75) {
      gtag('event', 'scroll_depth', {
        'depth_threshold': '75_percent',
        'page_path': window.location.pathname
      });
      scrollDepthTriggered75 = true;
    }

    if (!scrollDepthTriggered90 && scrollPercentage > 90) {
      gtag('event', 'scroll_depth', {
        'depth_threshold': '90_percent',
        'page_path': window.location.pathname
      });
      scrollDepthTriggered90 = true;
    }
  });

  document.querySelectorAll('a').forEach(link => {
    if (link.hostname === window.location.hostname) {
      link.addEventListener('click', function() {
        let linkPath = this.pathname;
        let linkText = this.textContent.trim();

        gtag('event', 'internal_link_click', {
          'link_path': linkPath,
          'link_text': linkText
        });
      });
    }
  });
});
