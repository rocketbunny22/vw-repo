# Redis concurrency migration

Mutable collection keys remain backward compatible (`users`, `pdfs`, `user_guides`, `comments`, and `feedback`). Each write now uses an adjacent integer version key named `<key>:version` and a Lua compare-and-set operation. Existing deployments need no one-time data rewrite: a missing version is treated as version `0`, and the first successful mutation creates version `1`.

Deploy the code before running any maintenance jobs. Older application versions must not write these keys after the deployment because they do not advance the version key. Rollback is safe for reads, but rolling back writers reintroduces lost-update risk.

PDF download counts use independent `pdf:downloads:<pdf-id>` counters. Password-reset records use expiring `reset_token:<HMAC digest>` keys and `reset_tokens_by_email:<SHA-256 email digest>` indexes. The legacy `reset_tokens` array is no longer read and may be deleted after all pre-deployment 15-minute reset links have expired.
