export interface Story {
  id: string;
  location: string;
  title: string;
  quote: string;
  quoteAuthor: string;
  fullBody: string[];
  source: string;
  type: 'urgent' | 'gold' | 'green' | 'default';
}

export const stories: Story[] = [
  {
    id: 'amber-elliott',
    location: 'Trinity County, Texas · April 2025',
    title: "Amber Elliott's Father — A Community Left With Nothing, Twice",
    quote: "You're talking two-lane country roads. There's no highway. They had to drive to Livingston, which is 45 minutes away, with my dad having a heart attack.",
    quoteAuthor: "Amber Elliott, July 2025",
    fullBody: [
      "When Bill Elliott had his first heart attack in 2019, his county's only hospital had already been closed for two years. His neighbor drove him 45 miles on two-lane country roads — no highway — to reach an emergency room in Livingston. His enzyme levels were rising throughout the drive. He was then transferred by ambulance to Lufkin.",
      "Trinity's hospital reopened in February 2024. Fourteen months later — April 2025 — it closed again, citing delayed Medicare and Medicaid reimbursements. The facility had been serving 400 emergency patients per month. The county's 14,000 residents, 27% of whom are over 65, are once again 30 miles from the nearest open emergency room.",
      "\"There are so many people who need that hospital,\" Amber said. \"But now, for any emergency, there's nothing.\"",
      "AtlasRoute cannot reopen a closed hospital. But it can immediately surface the nearest functioning alternatives — so no one wastes precious minutes driving to a darkened building before realizing they need to keep going."
    ],
    source: "Source: The Daily Yonder, \"Report: Over Half of Texas' Rural Hospitals Are at Risk of Closure,\" Madeline de Figueiredo, July 28, 2025. | Center for Healthcare Quality and Provider Reform, Rural Hospital Risk Report, June 2025.",
    type: 'urgent'
  },
  {
    id: 'brooklyn-sommerfeld',
    location: 'Chippewa Falls, Wisconsin · October 2025',
    title: "Brooklyn Sommerfeld — What a Paramedic Sees When Help Comes Too Late",
    quote: "They're more sick when we see them. And so you're kind of watching them… decompose almost in the back of the ambulance when you have them. It's overwhelming.",
    quoteAuthor: "Brooklyn Sommerfeld, ABC News, October 2025",
    fullBody: [
      "Brooklyn Sommerfeld is a paramedic at the Chippewa Falls Fire Station. She doesn't arrive before emergencies — she arrives during them. And since a regional hospital closure changed her community's healthcare landscape in 2025, what she sees in the back of her ambulance has changed in ways she finds deeply troubling.",
      "The pattern is documented: after a hospital closes, residents wait longer to call 911. Some cannot afford transport to a distant facility. By the time paramedics reach them, the condition has worsened significantly. The longer drive then compounds everything. Dr. Didion, a physician in the area, confirmed to ABC News: \"I know that we have had delays in care such that it resulted in someone getting irreversible progression in their disease state or even dying.\"",
      "AtlasRoute addresses the first link in this chain — the moment a patient doesn't know where to go and hesitates. Immediate, accurate information closes that gap."
    ],
    source: "Source: ABC News, \"'It can be a loss of life': First Responders Detail the Deadly Cost of Rural Hospital Closures,\" October 9, 2025.",
    type: 'default'
  },
  {
    id: 'brando-buban',
    location: 'Ortigas, Philippines · September 2025',
    title: "Brando Buban — The Truck Driver Who Didn't Know He Was Dying",
    quote: "I thought it was just high blood pressure, and I was just getting pale. I didn't know I was having a heart attack.",
    quoteAuthor: "Brando Buban, The Medical City, September 2025",
    fullBody: [
      "Brando Buban is a 45-year-old delivery truck driver. His workday begins before sunrise and ends long after dark, covering routes across Metro Manila. On a Tuesday morning in late 2025, while driving into Ortigas for a delivery, he felt a tightening in his chest and a strange pallor he had never experienced before.",
      "A nearby nurse noticed him and called an ambulance immediately. He was taken to The Medical City's Emergency Room. Doctors confirmed the heart attack and performed a successful angioplasty procedure to unblock his artery. His survival came down to one thing: someone who knew exactly where to send him.",
      "This story repeats daily among the 3.5 million commercial truck drivers in America, who face a 50% higher cardiovascular disease rate than the general population — and who are, by the nature of their work, always somewhere they've never been before. AtlasRoute is built for exactly this person, in exactly this moment."
    ],
    source: "Source: The Medical City, \"Truck Driver Saved from Heart Attack at The Medical City,\" September 12, 2025. | AAOHN Journal, \"Cardiovascular Disease in Commercial Drivers,\" 2023.",
    type: 'gold'
  },
  {
    id: 'rural-crisis',
    location: 'Rural America · 2025–2026 · An Ongoing Crisis',
    title: "The Communities Nobody Is Counting — Moulton. Waterville. Willows.",
    quote: "Nobody in state government, Medicare, Medicaid, or private insurance companies has any accountability for identifying where hospitals are needed...",
    quoteAuthor: "Prof. Alan Sager, Boston University School of Public Health, November 2025",
    fullBody: [
      "Not every story has a name. Some of the most consequential healthcare access failures in 2025 belong to people who never made the news — because their suffering was not dramatic enough to attract a camera, or because they simply endured quietly in places where no one was keeping count.",
      "In May 2025, Moulton, Alabama's Lawrence Medical Center ended emergency and inpatient services, leaving the entire county without an emergency department. On May 27, Northern Light Inland Hospital in Waterville, Maine, closed its doors. On September 30, Glenn Medical Center in Willows, California — serving the community for 75 years — shut down permanently.",
      "Boston University Professor Timothy Callaghan explained: \"After a hospital closes, people have to travel farther for care. They have to seek hospitals in larger cities, and in a true emergency, that can result in more negative health consequences or deaths that could have been avoided.\"",
      "The typical rural resident already travels twice as far as their urban counterpart — an average of 18 miles — to access medical care. With 700+ rural hospitals now at risk of closing, AtlasRoute ensures that when a person in any of these communities reaches for their phone at 2 AM, they find what is open."
    ],
    source: "Source: Boston University School of Public Health | Fierce Healthcare | AMA Journal of Ethics, July 2025.",
    type: 'green'
  }
];
