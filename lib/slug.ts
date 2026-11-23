export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const makePath = (make: string) => `/recalls/${slugify(make)}/`;
export const modelPath = (make: string, model: string) => `/recalls/${slugify(make)}/${slugify(model)}/`;
export const vehiclePath = (make: string, model: string, year: number) =>
  `/recalls/${slugify(make)}/${slugify(model)}/${year}/`;
