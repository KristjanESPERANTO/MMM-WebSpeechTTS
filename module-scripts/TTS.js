/* eslint-disable no-unused-vars */
/* global config Log */

// Initialize new SpeechSynthesisUtterance object
const speech = new SpeechSynthesisUtterance();

// Set speech Language
speech.lang = config.language;

function speak(text) {
  speechSynthesis.cancel();
  speech.text = text;
  const wrapper = document.getElementById("mmm-webspeechtts");
  if (wrapper !== null) wrapper.innerText = text;
  Log.log(text);
  speechSynthesis.speak(speech);
}

function getGreetingString() {
  const time = new Date();
  const hour = time.getHours();
  let greetingsString;
  if (hour > 18) {
    greetingsString = "Guten Abend. ";
  } else if (hour < 10) {
    greetingsString = "Guten Morgen. ";
  } else {
    greetingsString = "Guten Tag. ";
  }
  return greetingsString;
}

function getTimeAnnouncementString() {
  const time = new Date();
  const timeString = `Es ist ${time.getHours()} Uhr ${time.getMinutes()} .\n`;
  return timeString;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "g") {
    speak(getGreetingString());
  }
  if (event.key === "s") {
    speak("Ansage angehalten");
  }
  if (event.key === "t") {
    speak(getTimeAnnouncementString());
  }
});
