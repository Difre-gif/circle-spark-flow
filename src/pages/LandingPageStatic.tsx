import React, { useEffect, useState } from 'react';

const LandingPageStatic = () => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    fetch('/static-landing-page.html')
      .then(response => response.text())
      .then(data => setHtmlContent(data))
      .catch(error => console.error('Error loading static landing page HTML:', error));
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default LandingPageStatic;