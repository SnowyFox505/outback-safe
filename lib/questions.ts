import {
  Baby,
  BedDouble,
  Building2,
  Bus,
  Car,
  Caravan,
  Compass,
  Fish,
  Heart,
  Home,
  History,
  MapPin,
  Mountain,
  Plane,
  Sun,
  Tent,
  TreePine,
  Truck,
  User,
  Users,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TripAnswers } from "./types";

export interface Option {
  id: string;
  label: string;
  hint?: string;
  icon?: LucideIcon;
}

export type QuestionKey = keyof TripAnswers;

export interface Question {
  key: QuestionKey;
  title: string;
  subtitle: string;
  layout: "months" | "list" | "grid";
  multi?: boolean;
  required?: boolean;
  options: Option[];
}

const seasons = [
  "Summer",
  "Summer",
  "Autumn",
  "Autumn",
  "Autumn",
  "Winter",
  "Winter",
  "Winter",
  "Spring",
  "Spring",
  "Spring",
  "Summer",
];

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const questions: Question[] = [
  {
    key: "month",
    title: "When are you travelling?",
    subtitle: "This decides which hazards we show. Seasons are Australian.",
    layout: "months",
    required: true,
    options: monthLabels.map((label, i) => ({
      id: String(i + 1),
      label,
      hint: seasons[i],
    })),
  },
  {
    key: "duration",
    title: "How long is your trip?",
    subtitle: "A rough idea is enough.",
    layout: "list",
    options: [
      { id: "weekend", label: "A weekend" },
      { id: "1-2-weeks", label: "1 to 2 weeks" },
      { id: "3-4-weeks", label: "3 to 4 weeks" },
      { id: "longer", label: "Longer" },
    ],
  },
  {
    key: "transport",
    title: "How do you get around?",
    subtitle: "Pick everything that applies.",
    layout: "list",
    multi: true,
    options: [
      { id: "car", label: "Rental car", icon: Car },
      { id: "campervan", label: "Campervan", icon: Caravan },
      { id: "4wd", label: "4WD", icon: Truck },
      { id: "bus", label: "Bus", icon: Bus },
      { id: "flights", label: "Flights", icon: Plane },
      { id: "stay", label: "Staying in one place", icon: Home },
    ],
  },
  {
    key: "accommodation",
    title: "Where will you sleep?",
    subtitle: "Camping changes which hazards matter most.",
    layout: "list",
    options: [
      { id: "hotel", label: "Hotel or hostel", icon: BedDouble },
      { id: "campervan", label: "Campervan", icon: Caravan },
      { id: "camp", label: "Campsite or tent", icon: Tent },
    ],
  },
  {
    key: "party",
    title: "Who is travelling?",
    subtitle: "So we can keep the advice useful.",
    layout: "list",
    options: [
      { id: "solo", label: "Solo", icon: User },
      { id: "couple", label: "Couple", icon: Heart },
      { id: "friends", label: "Friends", icon: Users },
      { id: "family", label: "Family with kids", icon: Baby },
    ],
  },
  {
    key: "activities",
    title: "What are you planning?",
    subtitle: "Pick as many as you like.",
    layout: "grid",
    multi: true,
    options: [
      { id: "beach", label: "Beach and swimming", icon: Waves },
      { id: "snorkelling", label: "Snorkelling and diving", icon: Fish },
      { id: "hiking", label: "Hiking", icon: Mountain },
      { id: "parks", label: "National parks", icon: TreePine },
      { id: "cities", label: "Cities", icon: Building2 },
      { id: "outback", label: "Outback", icon: Sun },
    ],
  },
  {
    key: "firstTime",
    title: "Been to Australia before?",
    subtitle: "First timers get a little extra context.",
    layout: "list",
    options: [
      { id: "first", label: "First time", icon: Compass },
      { id: "before", label: "Been before", icon: History },
    ],
  },
];

export const summaryIcon = MapPin;
