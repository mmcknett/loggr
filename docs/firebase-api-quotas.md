# Firebase API Quotas
This writeup addresses issue #37.

## Background
Although the firebase API key is not secret (unlike most things called API keys), the API key can still be abused to threaten users' security. Specifically, if the app allows email/password login, as this one does, the default API quotas on Google's identity API make it feasible to execute a brute force attack to discover a valid email address and then guess the password. Google recommends adding quotas to limit the rate at which the key can be used. For this project, that means following the advice of this document: [Tighten quota if you use password-based Authentication](https://firebase.google.com/docs/projects/api-keys#apply-restrictions). Eureka Surveys [produced a writeup](https://medium.com/swlh/google-firebase-authentication-vulnerability-245050cb7ceb) explains how too-permissive an API quota can invite a brute force attack on user credentials.

The defaults currently allow significant volume. E.g. queries per minute on the Identity API of 180k. That's 30k queries per second. There's also a query per minute per user quota limit of 30k, which seems overly high.

## Quota recommendations
The Eureka Surveys writeup recommends two workaround:
1. Turn off sign in with password and only allow sign-in via email link. The idea here is to mitigate the damage of successfully discovering a user's password by requiring access to their email as well.
1. Turn down the quota limits (i.e. what Google recommends in their documentation). However, they don't give specific recommendations about *what* those limits should be.

## Quotas for this project
Right now the deployment has one active user. Signups were only recently opened up to the public, without any advertisement of the link, except to a few individuals. This means that expected users right now is less than 5. So how much capacity might we need?

The rate limit quotas on the identity toolkit API, which are the quotas we need to limit, are all "per minute" quotas. According to Google's documentation regarding [viewing the quotas](https://cloud.google.com/docs/quota#viewing_all_quota_console), the "current usage" of these metrics is displayed as the *total* usage for the past ten minutes. Interpreting that at face value, a limit of 10 provision requests per minute probably means one request per minute over the past ten minutes. Confusing, but to be safe, we should 10x the expected usage to account for this unclear definition and monitor to be sure.

Let's say the app suddenly becomes wildly popular and adds 10,000 daily active users within the next few months. That's 10k users/day / 1440 minutes/day = ~7 active users per minute. A daily quota of 70 identity API accesses per minute would give us 10x the required quantity of API accesses for an enormous influx of users. So which of these limits do we set to some multiple of 70? And do any need to be higher or lower?

Here's what the tables look like a few minutes after a couple of log out/log in actions on the app:

Quota | Limit | Current usage | Limit name | Considered | New Limit
--- | --- | --- | --- | --- | ---
Queries per minute | 180,000 | 2 | defaultPerMinutePerProject | ☑️ | 700
Batch Delete Accounts per minute | 3,000 | 0 | batchDeleteAccountsPerMinutePerProject | ☑️ | 2
Custom Token Sign In per minute | 20,000 | 0 | signInWithCustomTokenPerMinutePerProject | ☑️ | 0
Download Account per minute | 21,000 | 0 | downloadAccountPerMinutePerProject | ☑️ | 10
Provision Requests per minute | 10 | 0 | provisionPerMinutePerProject | ☑️ | 10
QueryUserInfo per minute | 900 | 0 | queryUserInfoPerMinutePerProject | ☑️ | 900
UpdateConfig per minute | 300 | 0 | updateConfigPerMinutePerProject | ☑️ | 300
Upload Account per minute | 3,600 | 0 | uploadAccountPerMinutePerProject |  ☑️ | 2
Provision Requests per minute per user | 10 | [not displayed] | provisionPerMinutePerUser | ☑️ | 10
Queries per minute per user | 30,000 | [not displayed] | defaultPerMinutePerUser | ☑️ | 10

So it seems like `defaultPerMinutePerProject` is the main target for quota limits. Presumably, that should be backed up by a quota on `defaultPerMinutePerUser`, which is, again presumably, in effect even though it isn't displayed in this table. Given the expected maximum usage, and these metrics, it probably makes sense to pick **700 queries per minute** (instead of 180,000), and back that up with **10 queries per minute per user** (instead of 30,000). That way, our ~7 active users per minute can do 10 queries each, every minute, with a margin of 10x for peak usage.

What about the other metrics?
- Batch metrics probably should be set near 0, because they should be rare: `batchDeleteAccountsPerMinutePerProject` and `uploadAccountPerMinutePerProject`
- Signing in with a custom token should also be near 0, since isn't currently enabled: `signInWithCustomTokenPerMinutePerProject`
- Provisioning limits are already low, and seem reasonable: `provisionPerMinutePerProject` and `provisionPerMinutePerUser`
- Download accounts should probably be near 0 as well. `downloadAccountPerMinutePerProject`
- Querying and updating user information should be relatively low, but account for peak. But they're already pretty close to 700 queries per minute, so let's leave them as default so we don't potentially interfere with users who want to make updates to their accounts.

## Verification
If the quota limitations cause problems for the system, record those problems here.

## Security Resources
While authoring this doc, some other useful security resources came up:
- [Firebase security checklist](https://firebase.google.com/support/guides/security-checklist)