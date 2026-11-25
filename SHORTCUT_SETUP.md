# NeurIPS Add Event — Apple Calendar Shortcut

This shortcut takes a conference appointment from the NeurIPS Sydney Guide PWA and creates an **editable event in an existing Apple Calendar** (not a subscription). One-time manual setup on iPhone is necessary because Apple only accepts signed shortcuts/iCloud-shared shortcuts; this repository cannot publish a signed iCloud shortcut from CI.

## Build the shortcut once (iOS 27)

1. In the **Shortcuts** app tap **+**, name the shortcut **NeurIPS Add Event** (the exact spelling matters).
2. Add **Get Dictionary from Input**, setting its input to the **Shortcut Input** variable with type **Text**.
3. Add **Get Dictionary Value**, select key `title`, from the dictionary result. Use **Set Variable** → `Title`.
4. Repeat the preceding action for these dictionary keys and variables:
   - `start` → `StartText`
   - `end` → `EndText`
   - `location` → `Venue`
   - `notes` → `Notes`
5. Add **Get Dates from Input** using `StartText`, then **Set Variable** → `StartDate`. Repeat for `EndText` and `EndDate`.
6. Add Calendar's **Add New Event** action and connect:
   - Title → `Title`
   - Start Date → `StartDate`
   - End Date → `EndDate`
   - Location → `Venue`
   - Notes → `Notes`
   - Calendar → your existing calendar (or **Ask Each Time**, where available)
   - **Show Compose Sheet** → ON, so you review before saving.
7. Save the shortcut. Allow access to Calendar on first run.

The PWA opens:
```text
shortcuts://run-shortcut?name=NeurIPS%20Add%20Event&input=text&text=<URL-encoded JSON>
```

Example input:
```json
{
  "title": "Pick up autoSAFE poster",
  "start": "2026-12-09T15:00:00+11:00",
  "end": "2026-12-09T15:20:00+11:00",
  "location": "ICC Sydney, Exhibition Centre Level 2, Registration Desk 4",
  "notes": "Collect poster two hours before main-track session."
}
```

The explicit **+11:00** Sydney offset is essential if the iPhone is configured for German time. Shortcuts supports ISO 8601 dates, but please check the parsed time in the Calendar editor on your first run.

If the source event does not have a confirmed start **and** end, the PWA does not launch the shortcut rather than invent an event duration.

## Troubleshooting

- If iOS says the shortcut cannot be found, verify the exact name **NeurIPS Add Event**.
- If the dictionary step shows empty results, change **Shortcut Input** to type **Text**.
- If dates are wrong, ensure the two **Get Dates from Input** actions parse the ISO 8601 strings including the `+11:00` offset.
- If the created event is missing its location or notes, verify the source dictionary keys and variable wiring.
- If you do not see a confirmation dialog, enable **Show Compose Sheet** in **Add New Event**.
- The shortcut can create duplicates if run twice. Inspect the existing event before saving again.

References:
- https://support.apple.com/guide/shortcuts/apd624386f42/ios
- https://support.apple.com/guide/shortcuts/apd43b69f337/ios
- https://support.apple.com/guide/shortcuts/apdfd459e13d/ios
