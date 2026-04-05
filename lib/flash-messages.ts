/** Query param and client-event keys for the global success ribbon (`?flash=`). */
export const FLASH_MESSAGES = {
  feeding_logged: { message: "Feeding logged." },
  batch_feeding_logged: {
    message: "Feeding saved for the selected dogs. Check each profile’s feeding log.",
  },
  medical_record_added: { message: "Medical record added." },
  medical_record_updated: { message: "Medical record updated." },
  medical_record_deleted: { message: "Medical record removed." },
  feeding_record_updated: { message: "Feeding log entry updated." },
  feeding_record_deleted: { message: "Feeding log entry removed." },
  photo_added: { message: "Photo added to this profile." },
  photo_card_updated: { message: "Card photo updated." },
  photo_removed: { message: "Photo removed." },
  photo_framing_saved: { message: "Photo framing saved." },
  locality_approved: { message: "Locality approved — it’s now visible everywhere." },
  locality_created: { message: "Locality created." },
  locality_updated: { message: "Locality saved." },
  locality_deleted: { message: "Locality deleted." },
  neighbourhood_approved: { message: "Neighbourhood approved — it’s now visible everywhere." },
  neighbourhood_created: { message: "Neighbourhood created." },
  neighbourhood_updated: { message: "Neighbourhood saved." },
  neighbourhood_deleted: { message: "Neighbourhood deleted." },
  dog_created: { message: "Dog profile created." },
  dog_updated: { message: "Dog profile saved." },
  user_created: { message: "User account created." },
  user_updated: { message: "User saved." },
  access_request_approved: { message: "Access request approved." },
  access_request_rejected: { message: "Access request rejected." },
} as const;

export type FlashKey = keyof typeof FLASH_MESSAGES;

export function isFlashKey(s: string | null): s is FlashKey {
  return s != null && s in FLASH_MESSAGES;
}
