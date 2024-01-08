/* global getGreetingString getTimeAnnouncementString speak */

setTimeout(() => {
  let firstTextToSpeech = getGreetingString();
  firstTextToSpeech += getTimeAnnouncementString();
  speak(firstTextToSpeech);
}, 10_000);
