import { TeamMember } from "@/types";

export const team: TeamMember[] = [
  {
    id: "tm-1",
    name: "Alex Chen",
    avatar: "AC",
    role: "developer",
  },
  {
    id: "tm-2",
    name: "Sara Kim",
    avatar: "SK",
    role: "developer",
  },
  {
    id: "tm-3",
    name: "Marcus Johnson",
    avatar: "MJ",
    role: "developer",
  },
  {
    id: "tm-4",
    name: "Priya Patel",
    avatar: "PP",
    role: "scrum-master",
  },
  {
    id: "tm-5",
    name: "Jordan Lee",
    avatar: "JL",
    role: "product-owner",
  },
  {
    id: "tm-6",
    name: "Dana Reeves",
    avatar: "DR",
    role: "developer",
  },
];

export const currentDeveloper = team[0];
