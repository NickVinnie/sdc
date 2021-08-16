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
    { target: 20, duration: "30s" },
    { target: 100, duration: "30s" },
    { target: 500, duration: "30s" },
    { target: 1000, duration: "30s" },
    { target: 2000, duration: "30s" },
    { target: 4000, duration: "1m" },
    { target: 8000, duration: "1m" },
    { target: 15000, duration: "1m" },
    { target: 0, duration: "30s" },
  ],
  thresholds: {},
};

export default function main() {
  let response;

  // get product info
  response = http.get("http://localhost:3000/products/47922");

  // get product styles
  response = http.get("http://localhost:3000/products/331114/styles");

  // get related
  response = http.get("http://localhost:3000/products/443122/related");

  // Automatically added sleep
  sleep(1);
}
