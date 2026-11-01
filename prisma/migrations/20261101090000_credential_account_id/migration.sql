-- Better Auth >= 1.7 requires credential accounts to have accountId = userId.
-- Older seeded accounts used the email as accountId, which blocks login.
UPDATE "Account" SET "accountId" = "userId" WHERE "providerId" = 'credential' AND "accountId" <> "userId";
