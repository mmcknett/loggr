import React, { useEffect } from 'react';
import { OneEightyRing } from 'react-svg-spinners';

export default function Spinner() {
  const [lightModeQuery, setLightModeQuery] = React.useState<{ matches: boolean }>({
    matches: false // dark mode by default
  });

  useEffect(() => {
    let mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    setLightModeQuery(mediaQuery);

    mediaQuery.addEventListener('change', setLightModeQuery);
    return () => mediaQuery.removeEventListener('change', setLightModeQuery);
  }, []);

  const color = lightModeQuery.matches ? 'black' : 'white';

  return <OneEightyRing color={ color } width="0.8em" height="0.8em"/>
}