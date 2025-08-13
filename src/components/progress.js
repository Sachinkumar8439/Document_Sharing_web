import React, { useEffect, useRef, useState } from 'react';
import "./progress.css"

const Progressbar = ({ line }) => {
  const progressRef = useRef();
  const [prevLine, setPrevLine] = useState(0);

  useEffect(() => {
    const isIncreasing = line.value > prevLine;

    if (progressRef.current) {
      const element = progressRef.current;

      if (isIncreasing) {
        element.style.transition = line.fast ? 'width 0.1s ease':'width 0.5s ease';
      } else {
        element.style.transition = 'none';
      }
      element.style.width = `${line.value}%`;
    }

    setPrevLine(line.value);
  }, [line]);

  return (
    <div className="progressbox">
      <div className="progressline" ref={progressRef}></div>
    </div>
  );
};

export default Progressbar;
