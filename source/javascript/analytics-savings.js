document.addEventListener('DOMContentLoaded', function () {
  gtag('set', 'user_properties', {
    interest_savings: 'medium'
  });

  let scrollSavingsTriggered = false;

  window.addEventListener('scroll', function () {
    let scrollPercentage =
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
      100;

    if (!scrollSavingsTriggered && scrollPercentage > 75) {
      gtag('set', 'user_properties', {
        interest_savings: 'high'
      });
      scrollSavingsTriggered = true;
    }
  });

  document.querySelectorAll('a').forEach(link => {
    if (
      link.textContent.toLowerCase().includes('ahorro') ||
      link.textContent.toLowerCase().includes('ahorrar') ||
      link.textContent.toLowerCase().includes('barato')
    ) {
      link.addEventListener('click', function () {
        gtag('event', 'savings_link_click', {
          link_text: this.textContent.trim()
        });

        gtag('set', 'user_properties', {
          interest_savings: 'high'
        });
      });
    }
  });
});
