
export interface Game {
    id: string;
    uid: string;
    date: string;
    name: string;
    shortName: string;
    season: Season;
    week: Week;
    competitions: Competition[];
}

interface Season {
    year: number;
    type: number;
    slug: string;
}

interface Week {
    number: number;
}

interface Competition {
    id: string;
    uid: string;
    date: string;
    attendance: number;
    type: Type;
    timeValid: boolean;
    neutralSite: boolean;
    conferenceCompetition: boolean;
    playByPlayAvailable: boolean;
    recent: boolean;
    venue: Venue;
    status: Status?;
    competitors: Competitor[];
}

interface Status {
    clock?: number;
    displayClock?: string;
    period?: number;
    type?: StatusType;
}

interface StatusType {
    id: string;
    type: string;
    state: string;
    completed: boolean;
    description: string;
    detail: string;
    shortDetail: string;
    name: string;
}

interface Type {
    id: string;
    abbreviation: string;
}

interface Venue {
    id: string;
    fullName: string;
    address: Address;
    capacity: number;
    indoor: boolean;
}

interface Address {
    city: string;
    state: string;
}

interface Competitor {
    id: string;
    uid: string;
    type: string;
    order: number;
    homeAway: string;
    winner: boolean;
    team: Team;
    score: string;
    linescores: LineScore[];
}

interface Team {
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
    logo: string;
    linescores?: LineScore[];
    score?: string;
}

interface Link {
    rel: string[];
    href: string;
    text: string;
    isExternal: boolean;
    isPremium: boolean;
}

interface LineScore {
    value?: number;
    displayValue?: string;
}