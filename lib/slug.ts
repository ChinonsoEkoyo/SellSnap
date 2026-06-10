import { nanoid } from "nanoid";

/**
 * Generates a unique slug for a product based on its title and a random ID.
 * Follows the format: `url-safe-title-abc123yz`
 */
export function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
    .replace(/(^-|-$)+/g, ""); // Remove trailing/leading hyphens

  const uniqueId = nanoid(8); // Short random ID

  return `${baseSlug}-${uniqueId}`;
}
