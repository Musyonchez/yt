import React from 'react';

const formatDuration = (seconds: number): string => {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds - (hours * 3600)) / 60);
  var remainingSeconds = seconds - (hours * 3600) - (minutes * 60);
  var time = "";

  if (hours!= 0) {
    time = hours + ":";
  }
  if (minutes!= 0 || time!== "") {
    minutes = (minutes < 10 && time!== "")? Number("0" + minutes) : Number(String(minutes));
    time += minutes + ":";
  }
  if (time === "") {
    time = remainingSeconds + "s";
  } else {
    time += (remainingSeconds < 10)? "0" + remainingSeconds : String(remainingSeconds);
  }
  return time;
};

export default formatDuration;
