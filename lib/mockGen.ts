import { z } from "zod";

export const GapFinderOut = z.object({
  wedge: z.object({
    one_liner: z.string(),
    why_it_wins: z.array(z.string()).min(1),
    target_user: z.string(),
    job_to_be_done: z.string()
  }),
  pain_clusters: z.array(
    z.object({
      label: z.string(),
      summary: z.string(),
      who: z.string(),
      severity_1_5: z.number().int().min(1).max(5),
      frequency_1_5: z.number().int().min(1).max(5),
      evidence_quotes: z.array(z.string()),
      current_workarounds: z.array(z.string())
    })
  ),
  willingness_to_pay_signals: z.array(
    z.object({
      signal: z.string(),
      evidence_quotes: z.array(z.string())
    })
  ),
  feature_gaps: z.array(
    z.object({
      gap: z.string(),
      why_users_care: z.string(),
      competitors_missing_it: z.array(z.string()),
      mvp_implementation_hint: z.string()
    })
  ),
  risks: z.array(
    z.object({
      risk: z.string(),
      mitigation: z.string(),
      validation_test: z.string()
    })
  ),
  next_7_days_tests: z.array(
    z.object({
      test: z.string(),
      success_metric: z.string(),
      how_to_run: z.string()
    })
  )
});

export const PositioningOut = z.object({
  icp: z.object({
    primary: z.string(),
    secondary: z.string(),
    excluded: z.array(z.string())
  }),
  problem_statement: z.string(),
  value_proposition: z.string(),
  why_now: z.array(z.string()),
  differentiators: z.array(z.string()),
  objections_and_rebuttals: z.array(z.object({ objection: z.string(), rebuttal: z.string() })),
  positioning_options: z.array(
    z.object({
      angle_name: z.string(),
      headline: z.string(),
      subhead: z.string(),
      proof_points: z.array(z.string()),
      best_channel_fit: z.array(z.string())
    })
  ),
  recommended_angle: z.string(),
  pricing_hypothesis: z.object({
    model: z.enum(["subscription", "usage", "one_time"]),
    starter_price: z.string(),
    pro_price: z.string(),
    reasoning: z.string()
  }),
  first_offer: z.object({
    offer: z.string(),
    guarantee_or_risk_reversal: z.string(),
    cta: z.string()
  })
});

export const AssetOut = z.object({
  sections: z.array(z.object({ key: z.string(), markdown: z.string() }))
});

export const PHOut = z.object({
  tagline: z.string(),
  description: z.string(),
  makers_comment: z.string(),
  top_3_features: z.array(z.string()),
  who_its_for: z.array(z.string()),
  pricing_blurb: z.string(),
  ask: z.string(),
  hashtags: z.array(z.string())
});

export const AppStoreOut = z.object({
  subtitle: z.string(),
  promo_text: z.string(),
  description_long: z.string(),
  feature_bullets: z.array(z.string()),
  keywords: z.array(z.string()),
  privacy_blurb: z.string()
});

export const SocialScriptsOut = z.object({
  scripts: z.array(
    z.object({
      hook: z.string(),
      beats: z.array(z.string()),
      on_screen_text: z.array(z.string()),
      cta: z.string()
    })
  )
});

export const EmailSeqOut = z.object({
  emails: z.array(
    z.object({
      day: z.number().int(),
      subject: z.string(),
      preview: z.string(),
      body_markdown: z.string(),
      cta: z.string()
    })
  )
});

export const VariantsOut = z.object({
  variants: z.array(
    z.object({
      key: z.enum(["A", "B"]),
      headline: z.string(),
      subhead: z.string(),
      cta: z.string(),
      landing_copy_markdown: z.string()
    })
  ),
  success_metric: z.string(),
  run_instructions: z.array(z.string())
});

// Deterministic-ish mock outputs
export function mockGapFinder(input: {
  projectName: string;
  nicheKeywords: string;
  icpGuess: string;
  competitorUrls: string;
  sourcesText: string;
}) {
  const kw = input.nicheKeywords.split(",").map(s => s.trim()).filter(Boolean);
  const k1 = kw[0] || "your niche";
  return GapFinderOut.parse({
    wedge: {
      one_liner: `An operations hub for ${k1} that turns leads into booked, profitable appointments with clean close-out.`,
      why_it_wins: [
        "Reduces admin and phone tag in a repeatable flow.",
        "Protects margin by standardizing pricing rules and scheduling buffers.",
        "Outputs are exportable and reusable (assets + templates)."
      ],
      target_user: input.icpGuess || "Busy solo operators who need a repeatable workflow.",
      job_to_be_done: "Fill my calendar with high-quality work and ship a launch faster with less guesswork."
    },
    pain_clusters: [
      {
        label: "Messaging + scheduling friction",
        summary: "Back-and-forth coordination slows deals and creates drop-off.",
        who: input.icpGuess || "Operators",
        severity_1_5: 4,
        frequency_1_5: 5,
        evidence_quotes: input.sourcesText ? ["“Too much back-and-forth.”"] : [],
        current_workarounds: ["Texts + notes", "Generic calendar invites"]
      },
      {
        label: "Pricing inconsistency",
        summary: "Quote variance causes margin loss and customer mistrust.",
        who: input.icpGuess || "Operators",
        severity_1_5: 4,
        frequency_1_5: 4,
        evidence_quotes: input.sourcesText ? ["“I never know what to charge.”"] : [],
        current_workarounds: ["Manual estimates", "Spreadsheet rules"]
      },
      {
        label: "End-of-day admin",
        summary: "Invoices, records, and follow-ups pile up and delay cash.",
        who: input.icpGuess || "Operators",
        severity_1_5: 3,
        frequency_1_5: 4,
        evidence_quotes: input.sourcesText ? ["“Admin takes forever at night.”"] : [],
        current_workarounds: ["Copy/paste templates", "Manual invoices"]
      }
    ],
    willingness_to_pay_signals: [
      { signal: "Users pay for tools that reduce admin and improve margins.", evidence_quotes: [] }
    ],
    feature_gaps: [
      {
        gap: "Quote → book → close-out in one workflow",
        why_users_care: "Fewer drop-offs, faster payment, fewer mistakes.",
        competitors_missing_it: ["Generic schedulers"],
        mvp_implementation_hint: "Booking page + rules + exportable summary."
      }
    ],
    risks: [
      {
        risk: "Sources are thin, outputs may be assumption-heavy.",
        mitigation: "Run 5 customer interviews and paste transcripts into Research.",
        validation_test: "A/B test two headlines and measure email captures."
      }
    ],
    next_7_days_tests: [
      {
        test: "Landing page A/B test for angle clarity",
        success_metric: "Email capture rate > 8%",
        how_to_run: "Share variant links in niche groups and track signups."
      }
    ]
  });
}

export function mockPositioning(input: {
  projectName: string;
  nicheKeywords: string;
  icpGuess: string;
  wedgeOneLiner: string;
}) {
  const kw = input.nicheKeywords.split(",").map(s => s.trim()).filter(Boolean);
  const niche = kw[0] || "your niche";
  return PositioningOut.parse({
    icp: {
      primary: input.icpGuess || `Busy ${niche} operators`,
      secondary: `Small teams in ${niche}`,
      excluded: ["Enterprise platforms", "Low-volume hobby users"]
    },
    problem_statement: `${niche} operators lose time and profit to coordination, inconsistent pricing, and admin.`,
    value_proposition: `${input.projectName} turns leads into booked, profitable work with standardized rules, templates, and clean close-out.`,
    why_now: [
      "Customers expect fast responses and simple booking.",
      "Competition is high; operational excellence wins.",
      "AI-assisted content makes marketing faster, but distribution still needs clarity."
    ],
    differentiators: [
      "Profit-first workflow (rules + buffers)",
      "Outputs you can copy/paste and reuse",
      "Built-in A/B experiments and tracking"
    ],
    objections_and_rebuttals: [
      { objection: "I already use notes + calendar.", rebuttal: "Not enough for consistent pricing, repeatable close-out, or launch assets." },
      { objection: "I’m too busy to learn a new tool.", rebuttal: "Start with one flow: create a quote/booking link and reuse it." }
    ],
    positioning_options: [
      {
        angle_name: "Profit & Margin",
        headline: `Stop losing margin in ${niche}.`,
        subhead: "Standardize pricing rules and book only high-quality work.",
        proof_points: ["Pricing rules", "Smart buffers", "Clean close-out exports"],
        best_channel_fit: ["Short-form videos", "Facebook groups"]
      },
      {
        angle_name: "Scheduling Speed",
        headline: "Book clients with one link.",
        subhead: "Cut phone tag and reduce drop-off with a simple flow.",
        proof_points: ["Address/details upfront", "Reminders", "Fast confirmations"],
        best_channel_fit: ["Google search", "Referrals"]
      },
      {
        angle_name: "Launch Kit",
        headline: "Generate your launch kit in minutes.",
        subhead: "Positioning, landing copy, and experiments from real customer sources.",
        proof_points: ["Research clustering", "Asset generation", "A/B tracking"],
        best_channel_fit: ["Product Hunt", "Indie communities"]
      }
    ],
    recommended_angle: "Profit & Margin",
    pricing_hypothesis: {
      model: "subscription",
      starter_price: "$19/mo",
      pro_price: "$49/mo",
      reasoning: "If it saves 1–2 hours/week or prevents one mispriced job, ROI is clear."
    },
    first_offer: {
      offer: "Free starter kit: booking link + first launch kit asset",
      guarantee_or_risk_reversal: "Cancel anytime. Keep exports.",
      cta: "Generate My Link"
    }
  });
}

export function mockLandingAsset(input: { projectName: string; nicheKeywords: string; icp: string; angle: string; valueProp: string; }) {
  const niche = input.nicheKeywords.split(",")[0]?.trim() || "your niche";
  return AssetOut.parse({
    sections: [
      { key: "hero", markdown: `# Book profitable ${niche} work—without the chaos.

**${input.projectName}** helps ${input.icp} standardize pricing and close out faster.

**CTA:** Generate My Launch Kit` },
      { key: "problem", markdown: `## The hidden leak

- Phone tag + delays
- Inconsistent quotes
- Admin piles up at night` },
      { key: "solution", markdown: `## One repeatable flow

Lead → quote → book → close-out (exports)` },
      { key: "how_it_works", markdown: `## How it works

1) Add sources
2) Generate insights + positioning
3) Generate launch assets
4) Run A/B variants` },
      { key: "final_cta", markdown: `## Ship faster with clarity

**CTA:** Create my first project` }
    ]
  });
}

export function mockProductHunt(input: { projectName: string; oneLiner: string; }) {
  return PHOut.parse({
    tagline: "Launch kit + experiments in one place",
    description: `${input.projectName} turns research into positioning, assets, and A/B variants you can track.`,
    makers_comment: `Hey PH 👋

We built ${input.projectName} to reduce the gap between “idea” and “launch.” Paste real customer signals, then generate a launch kit and run experiments.

What’s the hardest part of launching for you right now?`,
    top_3_features: ["Research clustering", "Launch kit generation", "A/B variant tracking"],
    who_its_for: ["Solo founders", "Small SaaS teams", "Agencies"],
    pricing_blurb: "Free to start; paid tiers unlock higher limits.",
    ask: "What feedback would help most?",
    hashtags: ["launch", "marketing", "saas"]
  });
}

export function mockAppStore(input: { projectName: string; }) {
  return AppStoreOut.parse({
    subtitle: "Research → positioning → launch assets",
    promo_text: "Turn signals into a launch plan in minutes.",
    description_long: `${input.projectName} helps you generate a launch plan from real customer signals.

- Paste sources
- Generate insights
- Create positioning
- Build assets
- Run A/B variants`,
    feature_bullets: ["Research clustering", "Positioning generator", "Landing copy packs", "Short-form scripts", "A/B tests"],
    keywords: ["launch", "marketing", "saas", "positioning", "copy", "growth", "product", "startup"],
    privacy_blurb: "Your workspace data is private. Export anytime."
  });
}

export function mockSocialScripts(input: { projectName: string; niche: string; cta: string; }) {
  const scripts = Array.from({ length: 10 }).map((_, i) => ({
    hook: `Launch mistake #${i + 1} that kills conversions`,
    beats: ["Show the mistake", "Show the fix", `Show ${input.projectName}`],
    on_screen_text: ["Mistake", "Fix", input.cta],
    cta: input.cta
  }));
  return SocialScriptsOut.parse({ scripts });
}

export function mockEmailSequence(input: { projectName: string; activationAction: string; }) {
  return EmailSeqOut.parse({
    emails: [
      { day: 0, subject: "Your first launch plan starts here", preview: "Create your first project in 2 minutes.", body_markdown: `Welcome to ${input.projectName}.

**Action:** ${input.activationAction}

Then paste 3–5 real customer quotes and generate insights.`, cta: input.activationAction },
      { day: 1, subject: "Pick ONE wedge (don’t boil the ocean)", preview: "Narrow wins faster.", body_markdown: "Today: choose a single wedge and one primary audience. Then generate positioning options.", cta: "Open Positioning" },
      { day: 3, subject: "Your landing page needs a job", preview: "One page, one promise.", body_markdown: "Generate landing copy, then cut it down. Remove anything that doesn’t help the CTA.", cta: "Generate Landing Copy" },
      { day: 5, subject: "Run a simple A/B test", preview: "Two headlines. One winner.", body_markdown: "Create an experiment with Variant A and B. Share both links and track signups.", cta: "Create Experiment" },
      { day: 7, subject: "Repeat what worked", preview: "Scale the winning message.", body_markdown: "Take the winning headline and produce 10 social scripts + outreach messages.", cta: "Generate Social Scripts" }
    ]
  });
}

export function mockVariants(input: { angleA: string; angleB: string; }) {
  return VariantsOut.parse({
    variants: [
      { key: "A", headline: input.angleA || "Stop losing margin.", subhead: "Standardize pricing and book better work.", cta: "Get Started", landing_copy_markdown: "### One flow from signal to launch.

- Research
- Positioning
- Assets

**Get your first kit today.**" },
      { key: "B", headline: input.angleB || "Launch in a weekend.", subhead: "Generate copy and run experiments fast.", cta: "Create Project", landing_copy_markdown: "### Ship with clarity.

- One wedge
- One audience
- One CTA

**Create your first project.**" }
    ],
    success_metric: "signup_rate",
    run_instructions: [
      "Split traffic 50/50.",
      "Run until each variant has at least N=100 views (or 7 days).",
      "Pick winner by signup_rate; use CTA_rate as secondary."
    ]
  });
}
