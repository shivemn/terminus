/**
 * The content contract. Every YAML file in content/ must match these schemas,
 * otherwise `npm run validate` (and therefore the build) fails.
 */
import { z } from 'zod';
import { ICON_NAMES } from './icons';

const id = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'ids must be kebab-case, e.g. "operating-systems"');

export const areaSchema = z.object({
  id,
  title: z.string().min(1),
});

export const resourceSchema = z.object({
  id,
  title: z.string().min(1),
  author: z.string().min(1),
  type: z.enum(['book', 'video', 'course', 'site']),
  url: z.url(),
  free: z.boolean(),
  /** How you use it: read it, watch it, or practise with it. */
  medium: z.enum(['read', 'watch', 'practice']),
  /** What people actually call it, e.g. "OSTEP" or "CLRS". Used by search. */
  short: z.string().optional(),
  note: z.string().optional(),
});

export const resourceSectionSchema = z.object({
  resource: id,
  /** Which part of the resource teaches this concept, e.g. "Lectures 9–14". */
  locator: z.string().min(1),
  role: z.enum(['primary', 'alternative', 'deep-dive']).default('primary'),
  /** False until a human has opened the resource and checked the locator. */
  verified: z.boolean().default(false),
  /** One line on why this is the pick, shown next to it. */
  why: z.string().optional(),
});

/**
 * What to build for a project stop, and what it has to show. Every project
 * has one; checkContent makes sure of it.
 */
export const projectBriefSchema = z.object({
  /** What to build, with a few concrete ideas. */
  build: z.string().min(1),
  /** What a finished version must show. These are what an interviewer looks for. */
  shows: z.array(z.string().min(1)).min(2),
  /** Where to take it further if there's time. */
  stretch: z.array(z.string().min(1)).default([]),
  /** How to put it in front of people: repo, demo, write-up. */
  present: z.string().min(1),
});
export type ProjectBrief = z.infer<typeof projectBriefSchema>;

/**
 * One thing a stop covers: a named subtopic and what you should be able to do
 * with it. These are what make a stop more than a title.
 */
export const coverSchema = z.object({
  topic: z.string().min(1),
  detail: z.string().min(1),
});
export type Cover = z.infer<typeof coverSchema>;

export const conceptSchema = z.object({
  id,
  title: z.string().min(1),
  area: id,
  /** A concept to understand, a tool to get fluent in, or a project to build and show. */
  kind: z.enum(['concept', 'tool', 'project']).default('concept'),
  summary: z.string().min(1),
  /** A one-tap "skip it" on the route, for a stop people often know another way. */
  skipLabel: z.string().min(1).optional(),
  hours: z.number().positive(),
  /** Hard prerequisites: must be learned first, and are pulled into a plan. */
  requires: z.array(id).default([]),
  /** Soft prerequisites: only nudge the order when both are already in a plan. */
  recommends: z.array(id).default([]),
  resources: z.array(resourceSectionSchema).min(1),
  /** What the stop covers, in the order you'd learn it. */
  covers: z.array(coverSchema).default([]),
  /** Projects only: the brief. */
  brief: projectBriefSchema.optional(),
});

export const backgroundSchema = z.object({
  /** Where it sits in the picker: a STEM degree, another degree, or no degree yet. */
  group: z.enum(['stem', 'other', 'none']),
  id,
  title: z.string().min(1),
  /** How it reads after "I'm", e.g. "a maths graduate" or "starting from zero". */
  phrase: z.string().min(1),
  description: z.string().min(1),
  knows: z.array(id),
});

export const familySchema = z.object({
  id,
  title: z.string().min(1),
  /** A line name for the network map, where space is tight. */
  short: z.string().min(1).optional(),
});

/**
 * A shelf on the tools page: languages, databases and so on. A tool is any
 * concept someone might come to learn on its own, whatever its kind.
 */
export const toolGroupSchema = z.object({
  id,
  title: z.string().min(1),
  tools: z.array(id).min(1),
});

/** A group on the practice page: practice resources that test the same kind of skill. */
export const practiceGroupSchema = z.object({
  id,
  title: z.string().min(1),
  resources: z.array(id).min(1),
});

/**
 * A job role (or an exam) and what it takes. Requirements come in tiers so a
 * fresher can see the short list that gets them hired before the long one.
 */
/** The three project levels a route offers. One of them is on the hiring list. */
export const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type Level = (typeof LEVELS)[number];
export const projectLevelsSchema = z.object({ beginner: id, intermediate: id, advanced: id });
export type ProjectLevels = z.infer<typeof projectLevelsSchema>;

export const roleSchema = z.object({
  id,
  title: z.string().min(1),
  family: id,
  kind: z.enum(['role', 'exam']).default('role'),
  /** What the job actually is, in a sentence or two. */
  summary: z.string().min(1),
  tiers: z.object({
    /** Needed to get hired as a fresher. */
    hire: z.array(id).min(1),
    /** Expected within the first year on the job. */
    firstYear: z.array(id).default([]),
    /** Useful, often asked about, rarely required. */
    extra: z.array(id).default([]),
  }),
  /**
   * Where the requirements come from. Without this, the role is a draft based
   * on our own judgement, and the site says so.
   */
  evidence: z
    .object({
      postings: z.number().int().positive(),
      region: z.string().min(1),
      collected: z.string().regex(/^\d{4}-\d{2}$/, 'use YYYY-MM'),
      note: z.string().optional(),
    })
    .optional(),
  /** Search term for the live job-board links, if the title isn't a good one. */
  search: z.string().optional(),
  /** A project at each level. The one on the hiring list is the default. */
  projects: projectLevelsSchema.optional(),
  /**
   * What an entry-level posting for this role looks like, written in our own
   * words from real listings. Counts are how many listings named each skill.
   */
  posting: z
    .object({
      source: z.string().min(1),
      listings: z.number().int().positive(),
      collected: z.string().regex(/^\d{4}-\d{2}$/, 'use YYYY-MM'),
      method: z.string().min(1),
      titles: z.array(z.string()).min(1),
      experience: z.string().min(1),
      doing: z.array(z.string()).min(1),
      asks: z.array(z.object({ skill: z.string(), listings: z.number().int().nonnegative() })).min(1),
      /** How many listings had skill tags at all; the asks are out of this. */
      tagged: z.number().int().positive(),
    })
    .optional(),
  /** An official description of the occupation, such as O*NET. */
  reference: z.object({ title: z.string(), url: z.string().url() }).optional(),
  /** Set by the loader on job titles from variants.yaml: the route this title builds on. */
  variantOf: id.optional(),
});

/**
 * A job title that is an existing route plus a few skills (content/variants.yaml).
 * The loader turns each one into a full role.
 */
export const variantSchema = z.object({
  id,
  title: z.string().min(1),
  extends: id,
  summary: z.string().min(1),
  /** Put on the hiring list. */
  adds: z.array(id).default([]),
  /** Taken off every tier, e.g. Java for a Python developer. */
  drops: z.array(id).default([]),
  search: z.string().optional(),
  /** Project levels that differ from the route's. Levels left out are the route's. */
  projects: projectLevelsSchema.partial().optional(),
});
export type Variant = z.infer<typeof variantSchema>;

export type Medium = z.infer<typeof resourceSchema>['medium'];
export const MEDIA: Medium[] = ['read', 'watch', 'practice'];

/**
 * The pick for each medium: the first free section of that medium, preferring
 * "primary" over "alternative". Deep dives are never the pick.
 */
export function picksFor(
  concept: { resources: Array<{ resource: string; role: string }> },
  resources: ReadonlyMap<string, { medium: Medium; free: boolean }>,
): Partial<Record<Medium, number>> {
  const out: Partial<Record<Medium, number>> = {};
  for (const role of ['primary', 'alternative']) {
    concept.resources.forEach((s, i) => {
      const r = resources.get(s.resource);
      if (!r || !r.free || s.role !== role || out[r.medium] !== undefined) return;
      out[r.medium] = i;
    });
  }
  return out;
}

export type Area = z.infer<typeof areaSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type ResourceSection = z.infer<typeof resourceSectionSchema>;
export type Concept = z.infer<typeof conceptSchema>;
export type Background = z.infer<typeof backgroundSchema>;

/** The picker's headings, in order. */
export const BACKGROUND_GROUPS: Array<{ id: Background['group']; title: string }> = [
  { id: 'stem', title: 'Science, tech, engineering or maths degree' },
  { id: 'other', title: 'Another degree' },
  { id: 'none', title: 'No degree' },
];
export type Family = z.infer<typeof familySchema>;
export type Role = z.infer<typeof roleSchema>;
export type ToolGroup = z.infer<typeof toolGroupSchema>;
export type PracticeGroup = z.infer<typeof practiceGroupSchema>;
export type Tier = keyof Role['tiers'];

export const TIERS: Array<{ id: Tier; title: string }> = [
  { id: 'hire', title: 'To get hired' },
  { id: 'firstYear', title: 'First year on the job' },
  { id: 'extra', title: 'Good to have' },
];

/** Targets for a role up to and including a tier. */
export function targetsUpTo(role: Role, tier: Tier): string[] {
  const order: Tier[] = ['hire', 'firstYear', 'extra'];
  return order.slice(0, order.indexOf(tier) + 1).flatMap((t) => role.tiers[t]);
}

/** How interviews go for a kind of job. See content/interviews.yaml. */
export const interviewSchema = z.object({
  id,
  title: z.string().min(1),
  who: z.string().min(1),
  routes: z.array(id).min(1),
  rounds: z
    .array(z.object({ name: z.string().min(1), what: z.string().min(1), practice: z.array(id).default([]) }))
    .min(1),
  revise: z.array(id).default([]),
});
export type Interview = z.infer<typeof interviewSchema>;

/** A certificate worth having for some routes. See content/certifications.yaml. */
export const certificationSchema = z.object({
  id,
  title: z.string().min(1),
  issuer: z.string().min(1),
  url: z.string().url(),
  group: z.enum(['software', 'data-ai', 'cloud', 'systems', 'security', 'finance', 'platforms', 'product', 'hardware', 'enterprise', 'business']),
  cost: z.enum(['free', 'low', 'mid', 'high']),
  price: z.string().min(1),
  why: z.string().min(1),
  routes: z.array(id).min(1),
});
export type Certification = z.infer<typeof certificationSchema>;

/** Where a job role links out to on job sites. See content/job-sites.yaml. */
export const jobSitesSchema = z.object({
  ambitionbox: z.string().regex(/^[a-z0-9-]+$/).optional(),
  wellfound: z.string().regex(/^[a-z0-9-]+$/).optional(),
  yc: z.enum(['software-engineer', 'product-manager', 'designer', 'operations', 'support', 'science', 'marketing', 'sales-manager', 'recruiting-hr']).optional(),
  kinds: z.array(z.string()).default([]),
});
export type JobSites = z.infer<typeof jobSitesSchema>;

const pairs = z.array(z.tuple([z.string(), z.number().int().nonnegative()]));
/** A dated summary of YC startups in India that were hiring, for the "At startups" note on role pages. */
export const startupsSchema = z.object({
  source: z.string(),
  url: z.string().url(),
  collected: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  companiesHiring: z.number().int(),
  postings: z.number().int(),
  counted: z.number().int(),
  countedNote: z.string(),
  withSkills: z.number().int(),
  experience: pairs,
  skills: pairs,
  kinds: z.record(z.string(), z.object({ n: z.number().int(), newGrad: z.number().int(), top: pairs })),
  companies: z.array(
    z.object({
      slug: z.string().regex(/^[a-z0-9-]+$/),
      name: z.string(),
      batch: z.string(),
      one: z.string(),
      city: z.string(),
      size: z.number().int(),
      open: z.number().int(),
      newGrad: z.number().int(),
      kinds: z.array(z.string()),
    }),
  ),
  notHiringTech: z.array(z.string()),
});
export type Startups = z.infer<typeof startupsSchema>;

/**
 * A worked system design: a diagram you can follow request by request,
 * short notes, and what the real companies published about their own
 * systems. Every company link must have been opened and checked.
 */
const point = z.tuple([z.number(), z.number()]);
const link = z.object({
  title: z.string().min(1),
  publisher: z.string().min(1),
  year: z.string().min(1),
  url: z.url(),
  /** True once someone has opened it and checked it says what we say. */
  verified: z.boolean().default(false),
});
export const designNodeKinds = ['edge', 'service', 'store', 'external'] as const;
export const designSchema = z.object({
  id,
  title: z.string().min(1),
  /** Real products this is like, e.g. ["WhatsApp", "Discord"]. */
  like: z.array(z.string().min(1)).min(1),
  level: z.enum(['starter', 'core', 'advanced']),
  /** 'app' for products people use; 'block' for the infrastructure they are built on. */
  group: z.enum(['app', 'block']).default('app'),
  /** Three to five sentences: how it works and what is hard. */
  summary: z.string().min(1),
  /** Stops this design uses, linked from the page and back from each stop. */
  stops: z.array(id).min(1),
  diagram: z.object({
    width: z.number().default(1240),
    height: z.number().default(640),
    nodes: z
      .array(
        z.object({
          id,
          name: z.string().min(1),
          sub: z.string().min(1),
          kind: z.enum(designNodeKinds),
          icon: z.enum(ICON_NAMES),
          x: z.number(),
          y: z.number(),
          w: z.number().optional(),
          /** The stop that teaches this piece. */
          stop: id.optional(),
        }),
      )
      .min(3),
    edges: z
      .array(
        z.object({
          id,
          /** Corner points of the wire, start to end. */
          pts: z.array(point).min(2),
          label: z.object({ text: z.string().min(1), x: z.number(), y: z.number(), anchor: z.enum(['start', 'middle', 'end']).default('middle') }).optional(),
          /** Both directions, like an open connection. */
          two: z.boolean().default(false),
        }),
      )
      .min(2),
  }),
  /** Requests followed through the diagram. Each step lights up its wires and boxes. */
  flows: z
    .array(
      z.object({
        id,
        name: z.string().min(1),
        steps: z.array(z.object({ text: z.string().min(1), edges: z.array(id).default([]), nodes: z.array(id).default([]) })).min(2),
      }),
    )
    .min(1),
  requirements: z.object({ features: z.array(z.string()).min(2), qualities: z.array(z.string()).min(2) }),
  numbers: z.object({
    /** Says plainly that these are our assumptions, and for what size of app. */
    assumption: z.string().min(1),
    rows: z.array(z.object({ what: z.string(), size: z.string(), how: z.string() })).min(2),
    /** Real figures, each from its own source. */
    realScale: z.array(z.object({ name: z.string(), text: z.string(), source: link })).default([]),
  }),
  decisions: z.array(z.object({ title: z.string().min(1), text: z.string().min(1) })).min(2),
  breaks: z.array(z.object({ what: z.string().min(1), fix: z.string().min(1) })).min(1),
  /** How the real ones built it: only from each company's own posts, talks or docs. */
  companies: z.array(z.object({ name: z.string().min(1), text: z.string().min(1), links: z.array(link).min(1) })).min(1),
  /** Outside diagrams worth seeing, credited. Linked, never copied. */
  others: z.array(z.object({ title: z.string(), publisher: z.string(), url: z.url(), licence: z.string().optional() })).default([]),
});
export type Design = z.infer<typeof designSchema>;

export interface Content {
  areas: Area[];
  families: Family[];
  concepts: Concept[];
  resources: Resource[];
  backgrounds: Background[];
  roles: Role[];
  toolGroups: ToolGroup[];
  practiceGroups: PracticeGroup[];
  jobSites: Record<string, JobSites>;
  interviews: Interview[];
  certifications: Certification[];
  startups: Startups;
  designs: Design[];
}
