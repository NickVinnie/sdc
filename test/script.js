import { sleep } from "k6";
import http from "k6/http";

export const options = {
  ext: {
    loadimpact: {
      distribution: {
        "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 100 },
      },
    },
  },
  stages: [
    { target: 100, duration: "30s" },
    { target: 500, duration: "30s" },
    { target: 1000, duration: "30s" },
    { target: 2000, duration: "30s" },
    { target: 3000, duration: "30s" },
    { target: 0, duration: "30s" },
  ],
  thresholds: {},
};

export default function main() {
  let res = http.get('http://localhost:3000/qa/questions/2000105/answers');

  // Automatically added sleep
  sleep(1);
}