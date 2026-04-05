# Success ribbon catalog

Global ribbon: `components/flash-ribbon.tsx` (URL `?flash=<key>` or client event `streetie-flash`). Copy lives in `lib/flash-messages.ts`.

To **turn off** a message: remove its key from `FLASH_MESSAGES` and stop passing that key from `redirectWithFlash` / `emitStreetieFlash`, or leave the key unused (unknown `?flash=` values are ignored).

## Implemented (ribbon shows today)

| Area | Action | Flash key | How |
|------|--------|-----------|-----|
| Feeding | Log feeding (one dog) | `feeding_logged` | `redirectWithFlash` → profile `#feeding` |
| Feeding | Batch log feeding | `batch_feeding_logged` | `redirectWithFlash` → `/dogs/feed` |
| Medical | Add medical record | `medical_record_added` | `redirectWithFlash` → edit `#medical` |
| Photos | Add URL / upload file | `photo_added` | `redirectWithFlash` → edit `#photos` |
| Photos | Set card (primary) photo | `photo_card_updated` | `redirectWithFlash` |
| Photos | Save focal / framing | `photo_framing_saved` | `redirectWithFlash` |
| Photos | Delete photo | `photo_removed` | `redirectWithFlash` |
| Dogs | Create dog | `dog_created` | `redirectWithFlash` → public profile |
| Dogs | Update dog (incl. hangouts, coat, etc.) | `dog_updated` | `redirectWithFlash` → public profile |
| Localities | Approve | `locality_approved` | `redirectWithFlash` |
| Localities | Create / update / delete | `locality_*` | `redirectWithFlash` |
| Neighbourhoods | Approve | `neighbourhood_approved` | `redirectWithFlash` |
| Neighbourhoods | Create / update / delete | `neighbourhood_*` | `redirectWithFlash` |
| Users | Create / update (super admin) | `user_created`, `user_updated` | `redirectWithFlash` |
| Access requests | Approve / reject | `access_request_*` | `emitStreetieFlash` (no navigation) |

## Other state-changing flows (recommendation)

| Flow | Recommendation | Notes |
|------|------------------|-------|
| **Request access** (`request-access/actions.ts`) | **Optional** | Form already switches to a full-page success state; a ribbon would duplicate that. |
| **Login** (`login/actions.ts`) | **No** | Redirect to app is the feedback; ribbon would be noisy. |
| **Forgot password** (`auth/forgot-password/actions.ts`) | **No** | Inline success + security-sensitive; avoid implying “email sent” globally. |
| **Photo actions — validation / not-found redirects** | **No** | Error paths use plain `redirect` without flash (correct). |
| **`fetchHomeDogsPage`** | **N/A** | Read-only; no ribbon. |

## If you want fewer ribbons

- **Batch feeding + single feeding**: keep both **Yes** (confirms write without scrolling).
- **Photo focal vs primary**: treat **primary** as **Yes**, **focal** as **Optional** (small tweak; many users expect subtle saves to stay quiet).
- **Locality/neighbourhood delete**: **Optional** (destructive; list refresh is strong feedback; ribbon still helps confirm intent).
- **User admin save**: **Yes** for create; **Optional** for update if the table already makes the change obvious.

When you decide, adjust `redirectWithFlash(..., key)` / `emitStreetieFlash` calls and/or remove keys from `FLASH_MESSAGES` if you want to retire copy centrally.
