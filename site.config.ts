// Everything a non-developer needs to edit lives in this file.
// Lines marked TODO still hold placeholder text: replace them before sharing the link.

export const site = {
  name: "Father Joe Marchese",
  shortName: "Father Joe",
  // TODO: e.g. "1941 – 2026". Leave empty to hide.
  lifespan: "",

  // TODO: drop the photo into /public (e.g. public/father-joe.jpg) and set the path here.
  // While this is null the page shows a simple monogram instead.
  photo: null as string | null,
  photoAlt: "Father Joe Marchese",

  // TODO: replace with the college's name. Used in the tribute and the share form.
  college: "the college",

  // TODO: replace with Matt's tribute. Each string is a paragraph.
  tribute: [
    "For generations of students, families and friends, Father Joe was a teacher, a priest and a friend who made people feel known.",
    "This page gathers the memories, photos and stories of those he impacted, so we can remember him together.",
  ],

  // TODO: fill in the times and places. Remove any entry that doesn't apply.
  services: [
    {
      title: "", // e.g. "Funeral Mass" or "Visitation". Leave empty to hide.
      when: "Saturday, October 31, 2026",
      time: "Time to be announced",
      where: "Location to be announced",
      mapUrl: "", // optional Google Maps link
    },
  ],
  // Optional line under the services, e.g. "In lieu of flowers, donations may be made to…"
  servicesNote: "",
};

// Options for "What is your connection to Fr. Joe?" Keep the values stable once memories exist,
// since Phase 2 filters on them. You can rename labels freely.
export const relationships = [
  { value: "student", label: "Student" },
  { value: "campus-ministry", label: "Campus ministry" },
  { value: "orientation-leader", label: "Orientation Leader" },
  { value: "retreat", label: "Retreat" },
  { value: "wedding", label: "He married us" },
  { value: "baptism", label: "Baptism" },
  { value: "sacrament", label: "Another sacrament" },
  { value: "colleague", label: "Colleague" },
  { value: "parish", label: "Parish" },
  { value: "family-friend", label: "Family or friend" },
  { value: "other", label: "Other" },
] as const;

export type RelationshipValue = (typeof relationships)[number]["value"];

export function relationshipLabel(value: string) {
  return relationships.find((r) => r.value === value)?.label ?? value;
}
