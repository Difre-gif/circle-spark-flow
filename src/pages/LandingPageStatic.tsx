import React, { useEffect, useState } from 'react';

const LandingPageStatic = () => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    fetch('/landing-content.html')
      .then(response => response.text())
      .then(data => setHtmlContent(data))
      .catch(error => console.error('Error loading landing page HTML:', error));
  }, []);

  // Using dangerouslySetInnerHTML to render the raw HTML
  // This is generally safe for trusted content like a static landing page
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default LandingPageStatic;