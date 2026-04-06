export const HOME_PAGE_SIZE = 12;

export type HomeDogFilters = {
  search: string;
  localityIds: string[];
  neighbourhoodIds: string[];
  gender: string | null;
  neutering: string | null;
  /** Any coat slot (primary / secondary / tertiary) equals this token. */
  colour: string | null;
  excludeDogId: string | null;
};

export type HomeDogCard = {
  id: string;
  slug: string;
  name: string;
  /** Alternate names (also searchable). */
  name_aliases: string[];
  gender: string;
  neutering_status: string;
  welfare_status: string;
  locality_id: string;
  locality_name: string;
  neighbourhood_id: string;
  neighbourhood_name: string;
  street_name: string | null;
  thumb_url: string | null;
  /** Meaningful when thumb_url is set; defaults 0.5 for center. */
  thumb_focal_x: number;
  thumb_focal_y: number;
};
