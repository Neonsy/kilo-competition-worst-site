// Random disclaimers to display throughout the site

export const disclaimers = [
  "By breathing near this site you agree to arbitration.",
  "Your data is our data is their data.",
  "This site may cause mild existential dread.",
  "No refunds of time are permitted.",
  "Use of this website constitutes acceptance of our emotional baggage.",
  "We are not responsible for any decisions made during or after your visit.",
  "Your visit is being monitored for quality assurance and mild amusement.",
  "The Museum of Bad Decisions is not liable for any good decisions made accidentally.",
  "By clicking anything, you waive your right to not have clicked it.",
  "This website may contain traces of nuts, irony, and JavaScript.",
  "Your soul is non-refundable.",
  "We reserve the right to judge you silently.",
  "Participation in this tour implies consent to being mildly insulted.",
  "The opinions expressed on this site are not opinions at all.",
  "By reading this disclaimer, you have agreed to read all disclaimers.",
  "This site is not responsible for any existential crises that may occur.",
  "Your click history has been forwarded to your mother.",
  "We are legally obligated to tell you that nothing here is legally binding.",
  "By existing, you agree to our terms. Terms are undefined.",
  "This website is carbon-neutral because we planted a digital tree somewhere.",
  "Your satisfaction is not guaranteed, implied, or even considered.",
  "We collect analytics on how confused you are right now.",
  "This site is best viewed with eyes open.",
  "By scrolling, you accept that there is more content below.",
  "Your IP address has been logged and judged.",
  "This website is not a substitute for professional decision-making advice.",
  "We are not responsible for any regret caused by this regret museum.",
  "By entering, you acknowledge that time is a flat circle.",
  "Your decisions here have no consequences, unlike your real decisions.",
  "This site is powered by chaos and questionable design choices.",
];

export const popupMessages = [
  {
    title: "WAIT!",
    message: "Are you sure you're sure? Think about it. Think harder. Okay, proceed.",
    buttonText: "I guess",
  },
  {
    title: "Browser Notice",
    message: "This site works best in 2006. Please downgrade your browser for the optimal experience.",
    buttonText: "Whatever",
  },
  {
    title: "Important Alert",
    message: "Enable Java (not JavaScript) to continue. We'll wait. Take your time.",
    buttonText: "I can't",
  },
  {
    title: "Session Warning",
    message: "Your session will expire in -3 minutes. Time travel is not supported.",
    buttonText: "Oh no",
  },
  {
    title: "Congratulations!",
    message: "You are our 10,000th visitor today! Your prize: more of this website.",
    buttonText: "Claim nothing",
  },
  {
    title: "Cookie Notice",
    message: "We use cookies. You will eat cookies. This is mandatory.",
    buttonText: "Feed me",
  },
  {
    title: "Subscription Offer",
    message: "Subscribe to our newsletter! We promise to never email you. Ever.",
    buttonText: "Sounds fake",
  },
  {
    title: "Error",
    message: "Error: Success! Something went right for once. This is unexpected.",
    buttonText: "Continue?",
  },
  {
    title: "Attention",
    message: "Your attention has been captured. It will be returned in 3-5 business days.",
    buttonText: "Okay then",
  },
  {
    title: "Survey Request",
    message: "How likely are you to recommend this site to your enemies? (Scale: Very to Extremely)",
    buttonText: "Very",
  },
];

export function getRandomDisclaimer(): string {
  return disclaimers[Math.floor(Math.random() * disclaimers.length)];
}

export function getRandomPopup(): typeof popupMessages[number] {
  return popupMessages[Math.floor(Math.random() * popupMessages.length)];
}
