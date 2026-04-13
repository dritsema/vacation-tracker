export const CATEGORIES = [
  { id: "breakfast", label: "Breakfast", color: "#FAC775", text: "#633806" },
  { id: "lunch",     label: "Lunch",     color: "#C0DD97", text: "#27500A" },
  { id: "activity",  label: "Activity",  color: "#B5D4F4", text: "#0C447C" },
  { id: "dinner",    label: "Dinner",    color: "#F4C0D1", text: "#72243E" },
];

export const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

export const emptyForm = { name: "", category: "activity", notes: "", priority: 2 };
