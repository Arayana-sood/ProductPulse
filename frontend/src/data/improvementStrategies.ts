export interface Strategy {
  id: string;
  category: 'engagement' | 'purchase_frequency' | 'inactivity' | 'retention' | 'repeat_purchases';
  categoryLabel: string;
  title: string;
  action: string;
  rationale: string;
  example: string;
  badge?: string;
}

export const CATEGORIES = [
  { id: 'all', label: 'All Strategies' },
  { id: 'engagement', label: 'Increasing User Engagement' },
  { id: 'purchase_frequency', label: 'Improving Purchase Frequency' },
  { id: 'inactivity', label: 'Reducing User Inactivity' },
  { id: 'retention', label: 'Improving Customer Retention' },
  { id: 'repeat_purchases', label: 'Encouraging Repeat Purchases' },
] as const;

export const IMPROVEMENT_STRATEGIES: Strategy[] = [
  // 1. Increasing User Engagement
  {
    id: 'eng-1',
    category: 'engagement',
    categoryLabel: 'Increasing User Engagement',
    title: 'Personalized Product Recommendations',
    action: 'Dynamically surface complementary products and trending category picks on search, catalog, and home views.',
    rationale: 'Deepens exploration depth and raises events-per-session by matching catalog depth to inferred customer aesthetic or preference.',
    example: 'When a user views liquid foundation, immediately display top-rated setting sprays and blending sponges under "Frequently Paired Together".',
    badge: 'Popular'
  },
  {
    id: 'eng-2',
    category: 'engagement',
    categoryLabel: 'Increasing User Engagement',
    title: 'Micro-Milestone Exploration Gamification',
    action: 'Incentivize multi-category browsing with progressive session discovery rewards.',
    rationale: 'Overcomes the single-page bounce trap by rewarding users for discovering 3+ distinct product lines within their first 24 hours.',
    example: 'Show an unobtrusive session banner: "Browse 3 skincare formulas to unlock a complimentary virtual skin consultation guide."',
    badge: 'Engagement Booster'
  },

  // 2. Improving Purchase Frequency
  {
    id: 'freq-1',
    category: 'purchase_frequency',
    categoryLabel: 'Improving Purchase Frequency',
    title: 'Personalized Offers & Cart Recovery Discounts',
    action: 'Deliver targeted, time-sensitive incentives to users displaying high cart activity without completed transactions.',
    rationale: 'Converts latent purchase intent into transactions by removing price resistance and creating bounded decision urgency.',
    example: 'Send an automated push notification within 2 hours: "Complete your cart today and unlock 10% off plus free expedited delivery."',
    badge: 'High Conversion'
  },
  {
    id: 'freq-2',
    category: 'purchase_frequency',
    categoryLabel: 'Improving Purchase Frequency',
    title: 'One-Click Routine Bundling',
    action: 'Package multi-step cosmetic products into a single pre-configured checkout bundle with volume pricing.',
    rationale: 'Reduces cart removal friction and accelerates checkout velocity by consolidating disparate purchasing decisions into one click.',
    example: 'Offer a "Complete Morning Skincare Routine" bundle containing cleanser, toner, and moisturizer at a bundled 15% savings.',
    badge: 'AOV Multiplier'
  },

  // 3. Reducing User Inactivity
  {
    id: 'inact-1',
    category: 'inactivity',
    categoryLabel: 'Reducing User Inactivity',
    title: 'Automated Multi-Channel Re-engagement Campaigns',
    action: 'Deploy structured winback sequences across email and push before a user crosses the 7-to-10 day inactivity threshold.',
    rationale: 'Re-ignites lapsed interest before memory fade sets in, pulling at-risk users back into active browsing cycles.',
    example: 'For users without sessions in 4 days, dispatch an email digest: "Your favorite brands just released 12 new items — see what\'s trending."',
    badge: 'Churn Prevention'
  },
  {
    id: 'inact-2',
    category: 'inactivity',
    categoryLabel: 'Reducing User Inactivity',
    title: 'Targeted Promotions for Declining Engagement',
    action: 'Detect decelerating session frequency and deliver exclusive reactive promotions to restore active status.',
    rationale: 'Signals customer value appreciation and reduces dormancy by providing an immediate, high-margin transactional reward.',
    example: 'Trigger a banner upon next visit: "Welcome back! Here is an exclusive $5 gift voucher valid for the next 48 hours."',
    badge: 'Winback'
  },

  // 4. Improving Customer Retention
  {
    id: 'ret-1',
    category: 'retention',
    categoryLabel: 'Improving Customer Retention',
    title: 'Predictive Churn Interventions',
    action: 'Leverage the SVM decision score to trigger proactive customer success and retention offers before permanent disengagement.',
    rationale: 'Intervening while the user is still in the exploration window is up to 5x cheaper than acquiring a replacement user.',
    example: 'When SVM score drops below -0.5, offer a dedicated beauty advisor chat prompt or an immediate risk-free return guarantee.',
    badge: 'Predictive ML'
  },
  {
    id: 'ret-2',
    category: 'retention',
    categoryLabel: 'Improving Customer Retention',
    title: 'New Cohort Onboarding & Guided Discovery',
    action: 'Guide first-time casual visitors through an interactive 3-step value discovery flow to build immediate platform familiarity.',
    rationale: 'Over 94% of users start as Casual Explorers; structured first-session onboarding increases Day-14 return rates by up to 32%.',
    example: 'Launch an optional 45-second beauty preference quiz that automatically curates a customized storefront feed.',
    badge: 'Onboarding'
  },

  // 5. Encouraging Repeat Purchases
  {
    id: 'rep-1',
    category: 'repeat_purchases',
    categoryLabel: 'Encouraging Repeat Purchases',
    title: 'Tiered Loyalty Rewards & Points Multipliers',
    action: 'Award points, VIP perks, and early-access privileges that accrue with every completed order and session visit.',
    rationale: 'Creates economic and emotional switching barriers while incentivizing regular return visits to redeem accumulated benefits.',
    example: 'After purchase: "You just earned 150 Pulse Points! Reach 300 points to unlock Bronze Tier status and free birthday gifts."',
    badge: 'Loyalty Driver'
  },
  {
    id: 'rep-2',
    category: 'repeat_purchases',
    categoryLabel: 'Encouraging Repeat Purchases',
    title: 'Predictive Replenishment Reminders & Subscriptions',
    action: 'Calculate expected product depletion cycles and deliver timely reorder reminders right before the supply runs out.',
    rationale: 'Captures the repurchase at the exact moment of consumer need before they search competing platforms or retail stores.',
    example: 'Send a prompt 28 days post-purchase: "Your 50ml hydrating serum may be running low. Tap here for 1-click doorstep replenishment."',
    badge: 'Automated LTV'
  }
];
