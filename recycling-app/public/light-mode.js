// Force light mode immediately on page load
(function() {
  document.documentElement.classList.remove('dark');
  document.documentElement.classList.add('light');
  document.documentElement.style.colorScheme = 'light';
  document.documentElement.style.backgroundColor = '#ffffff';

  // Override any system preferences
  if (window.matchMedia) {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (darkModeQuery && darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', function(e) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.style.colorScheme = 'light';
      });
    }
  }
})();