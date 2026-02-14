/* eslint-disable no-console */
const axios = require("axios");

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
const now = Date.now();

const brandUser = {
  email: `brand-${now}@example.com`,
  password: "Brand123!",
  name: "Smoke Brand",
  role: "BRAND",
};

const influencerUser = {
  email: `influencer-${now}@example.com`,
  password: "Influencer123!",
  name: "Smoke Influencer",
  role: "INFLUENCER",
};

function endpoint(name, data) {
  console.log(`✓ ${name}`);
  return data;
}

async function request(method, path, token, data) {
  const response = await axios({
    method,
    url: `${BASE_URL}${path}`,
    data,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    throw new Error(
      `${method.toUpperCase()} ${path} failed: ${response.status} ${JSON.stringify(response.data)}`,
    );
  }

  if (response.data && typeof response.data === "object" && "success" in response.data) {
    if (!response.data.success) {
      throw new Error(`${method.toUpperCase()} ${path} returned success=false`);
    }
    return response.data.data;
  }

  return response.data;
}

async function main() {
  const brandRegister = await request("post", "/auth/register", null, brandUser);
  endpoint("auth/register brand", brandRegister);

  const influencerRegister = await request("post", "/auth/register", null, influencerUser);
  endpoint("auth/register influencer", influencerRegister);

  const brandLogin = await request("post", "/auth/login", null, {
    email: brandUser.email,
    password: brandUser.password,
  });
  endpoint("auth/login brand", brandLogin);

  const influencerLogin = await request("post", "/auth/login", null, {
    email: influencerUser.email,
    password: influencerUser.password,
  });
  endpoint("auth/login influencer", influencerLogin);

  const brandToken = brandLogin.token;
  const influencerToken = influencerLogin.token;

  await request("post", "/auth/me", brandToken);
  endpoint("auth/me", null);

  await request("get", "/influencers/league", null);
  endpoint("influencers/league", null);

  await request("get", "/influencers/search?category=General", null);
  endpoint("influencers/search", null);

  const campaign = await request("post", "/campaigns", brandToken, {
    title: `Smoke Campaign ${now}`,
    description: "Smoke campaign description for endpoint testing.",
    budget: 5000,
    platform: "INSTAGRAM",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    requirements: "At least one post",
  });
  endpoint("campaigns/create", campaign);

  const bid = await request("post", `/campaigns/${campaign.id}/bids`, influencerToken, {
    price: 1200,
    proposal: "I can deliver quality content for this campaign.",
    deliveryTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  });
  endpoint("campaigns/submit bid", bid);

  const bids = await request("get", `/campaigns/${campaign.id}/bids`, brandToken);
  endpoint("campaigns/list bids", bids);

  const deal = await request("post", `/campaigns/bids/${bid.id}/accept`, brandToken);
  endpoint("campaigns/accept bid", deal);

  await request("get", "/deals", brandToken);
  endpoint("deals/list", null);

  await request("post", `/deals/${deal.id}/content`, influencerToken, {
    contentUrl: "https://example.com/content/smoke",
  });
  endpoint("deals/submit content", null);

  await request("post", `/deals/${deal.id}/approve`, brandToken);
  endpoint("deals/approve", null);

  await request("post", `/deals/${deal.id}/complete`, brandToken);
  endpoint("deals/complete", null);

  await request("post", `/chat/${deal.id}/messages`, brandToken, {
    content: "Smoke chat message from brand",
  });
  endpoint("chat/send message", null);

  await request("get", `/chat/${deal.id}/messages`, influencerToken);
  endpoint("chat/get messages", null);

  console.log("\nSmoke API passed for core endpoint chain.");
}

main().catch((error) => {
  console.error("\nSmoke API failed:");
  console.error(error.message);
  process.exit(1);
});

