/** Query param and client-event keys for the global success ribbon (`?flash=`). */
export const FLASH_MESSAGES = {
  feeding_logged: { message: "Feeding logged." },
  batch_feeding_logged: {
    message: "Feeding logged for the selected dogs.",
  },
  medical_record_added: { message: "Medical record saved." },
  medical_record_updated: { message: "Medical record updated." },
  medical_record_deleted: { message: "Medical record removed." },
  feeding_record_updated: { message: "Feeding entry updated." },
  feeding_record_deleted: { message: "Feeding entry removed." },
  photo_added: { message: "Photo added." },
  photo_card_updated: { message: "Card photo updated." },
  photo_removed: { message: "Photo removed." },
  photo_framing_saved: { message: "Photo framing saved." },
  locality_approved: { message: "Locality approved — now visible across the app." },
  locality_created: { message: "Locality created." },
  locality_updated: { message: "Locality updated." },
  locality_deleted: { message: "Locality deleted." },
  neighbourhood_approved: { message: "Neighbourhood approved — now visible across the app." },
  neighbourhood_created: { message: "Neighbourhood created." },
  neighbourhood_updated: { message: "Neighbourhood updated." },
  neighbourhood_deleted: { message: "Neighbourhood deleted." },
  dog_created: { message: "Dog added to the directory." },
  dog_updated: { message: "Dog profile updated." },
  welfare_updated: { message: "Welfare Check updated." },
  welfare_check_added: { message: "Welfare Check recorded." },
  user_created: { message: "User account created." },
  user_updated: { message: "User updated." },
  access_request_approved: { message: "Access request approved." },
  access_request_rejected: { message: "Access request rejected." },
  profile_saved: { message: "Profile saved." },
  carer_added_self: { message: "You're now listed as a carer for this dog." },
  carer_prompt_dismissed: { message: "We won’t ask again about adding you as a carer for this dog." },
} as const;

export type FlashKey = keyof typeof FLASH_MESSAGES;

export function isFlashKey(s: string | null): s is FlashKey {
  return s != null && s in FLASH_MESSAGES;
}
