document.addEventListener('DOMContentLoaded', function () {
  const calculatorInputs = document.querySelectorAll(
    '.calculator-input, input[type="number"], .calculator input'
  );
  if (calculatorInputs.length > 0) {
    let calculatorStarted = false;

    calculatorInputs.forEach(input => {
      input.addEventListener('focus', function () {
        if (!calculatorStarted) {
          gtag('event', 'calculator_start', {
            calculator_type: 'savings_calculator'
          });
          calculatorStarted = true;

          gtag('set', 'user_properties', {
            interest_savings: 'high'
          });
        }
      });
    });

    const calculateButtons = document.querySelectorAll(
      '.calculate-button, button[type="submit"], .calculator button'
    );
    if (calculateButtons.length > 0) {
      calculateButtons.forEach(button => {
        button.addEventListener('click', function () {
          let resultValue = '';
          const resultElements = document.querySelectorAll(
            '.result-display, .result, .calculator-result'
          );
          if (resultElements.length > 0) {
            resultValue = resultElements[0].textContent.trim();
          }

          gtag('event', 'calculator_complete', {
            calculator_type: 'savings_calculator',
            calculation_result: resultValue
          });
        });
      });
    }

    setTimeout(function () {
      if (
        document.querySelector(
          '.calculator:hover, .calculator-container:hover, form:hover'
        )
      ) {
        gtag('event', 'calculator_engagement', {
          engagement_time: '30_seconds'
        });
      }
    }, 30000);
  }
});
