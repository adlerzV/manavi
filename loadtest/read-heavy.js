import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    home: { executor: "ramping-vus", startVUs: 0, stages: [
      { duration: "30s", target: 200 },
      { duration: "2m", target: 200 },
      { duration: "30s", target: 0 },
    ]},
  },
};

const BASE_URL = __ENV.BASE_URL || "https://your-preview-url.vercel.app";

export default function () {
  const res = http.get(`${BASE_URL}/app`);
  check(res, { "status 200": (r) => r.status === 200 });
  sleep(1);
}