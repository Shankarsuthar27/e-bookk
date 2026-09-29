'use client';

import React from 'react';

/**
 * Simple AdBanner component (160x300)
 */
export default function AdBanner({ className = '' }) {
  const adHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 160px;
      height: 300px;
      overflow: hidden;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '4251a3beda763fc1fda7c28c3dc521cf',
      'format' : 'iframe',
      'height' : 300,
      'width' : 160,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highrevenueformat.com/4251a3beda763fc1fda7c28c3dc521cf/invoke.js"></script>
</body>
</html>`;

  return (
    <div className={`flex justify-center items-center my-4 ${className}`}>
      <iframe
        title="Advertisement"
        srcDoc={adHtml}
        width="160"
        height="300"
        scrolling="no"
        style={{ border: 'none', width: '160px', height: '300px', overflow: 'hidden' }}
      />
    </div>
  );
}
