/* global speak getTimeAnnouncementString getGreetingString */

setTimeout(() => {
  let firstTextToSpeech = getGreetingString();
  firstTextToSpeech += getTimeAnnouncementString();
  speak(firstTextToSpeech);
}, 10000);
