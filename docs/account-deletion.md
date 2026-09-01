# Account deletion retention policy

Account deletion removes the user record and its private profile, garage, bookmark, checklist, onboarding, password, and session data. Outstanding password-reset tokens are revoked.

Pending guides and pending PDF metadata owned by the user are deleted. A pending PDF blob is deleted when no remaining metadata record references it.

Approved community guides, approved PDFs, and comments remain available so public resources and discussions are not broken, but their author attribution is replaced with “Deleted user” and the account identifier is removed. Feedback linked by email is retained for operational history with its name and email anonymized.

Each completed deletion writes a bounded audit record containing account and actor IDs, timestamp, and aggregate deletion counts. It does not retain email addresses, usernames, profile fields, or submitted text.
