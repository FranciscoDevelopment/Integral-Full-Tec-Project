import type { JobOffer, News, User } from "@/shared/types";
import jobs from "./jobs.json";
import news from "./news.json";
import users from "./users.json";

// JSON widens enum strings to `string`, so the casts below give features typed access.
// Features must read these only through their own api.ts.
export const MOCK_USERS = users as User[];
export const MOCK_NEWS = news as News[];
export const MOCK_JOBS = jobs as JobOffer[];
