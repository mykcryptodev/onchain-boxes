type SeasonEvent = {
  year: number;
  type: number;
  slug: string;
};

type WeekEvent = {
  number: number;
};

type Address = {
  city: string;
  state: string;
};

type Venue = {
  id: string;
  fullName: string;
  address: Address;
  capacity: number;
  indoor: boolean;
};

type TeamDetail = {
  id: string;
  uid: string;
  location: string;
  name: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  color: string;
  alternateColor: string;
  isActive: boolean;
  venue: Venue;
  links: Link[];
  // ... potentially other attributes
};

type Competitor = {
  id: string;
  uid: string;
  type: string;
  order: number;
  homeAway: string;
  team: TeamDetail;
  // ... potentially other attributes
};

type Competition = {
  id: string;
  uid: string;
  date: string;
  attendance: number;
  type: SeasonType; // Reusing the previously defined type
  timeValid: boolean;
  neutralSite: boolean;
  conferenceCompetition: boolean;
  playByPlayAvailable: boolean;
  recent: boolean;
  venue: Venue;
  competitors: Competitor[];
  format: any; // This can be expanded based on the details of the 'format' object
  tickets: any[]; // This can be expanded based on the details of the 'tickets' object
  startDate: string;
  geoBroadcasts: any[]; // This can be expanded based on the details of the 'geoBroadcasts' object
  odds: any[]; // This can be expanded based on the details of the 'odds' object
};

type Weather = {
  displayValue: string;
  temperature: number;
  highTemperature: number;
  conditionId: string;
  link: Link;
};

type Status = {
  clock: number;
  displayClock: string;
  period: number;
  type: SeasonType; // Reusing the previously defined type
};

type Event = {
  id: string;
  uid: string;
  date: string;
  name: string;
  shortName: string;
  season: SeasonEvent;
  week: WeekEvent;
  competitions: Competition[];
  links: Link[];
  weather: Weather;
  status: Status;
};

export type EventsResponse = Event[];
