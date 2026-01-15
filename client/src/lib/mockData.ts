import avatarMale from '@assets/generated_images/cyberpunk_tech_professional_avatar_male.png';
import avatarFemale from '@assets/generated_images/cyberpunk_tech_professional_avatar_female.png';
import avatarAndro from '@assets/generated_images/cyberpunk_tech_professional_avatar_androgynous.png';

const avatars = [avatarMale, avatarFemale, avatarAndro];

const firstNames = ['Alex', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Taylor', 'Avery', 'Parker', 'Quinn', 'Skyler', 'Hiro', 'Suki', 'Zane', 'Lyra', 'Kael', 'Nova', 'Orion', 'Vega', 'Ryla', 'Jinx'];
const lastNames = ['Chen', 'Smith', 'Kim', 'Patel', 'Rivera', 'Zhang', 'Kowalski', 'Dubois', 'Silva', 'Tanaka', 'Sterling', 'Vance', 'Mercer', 'Steel', 'Frost', 'Shadow', 'Light', 'Byte', 'Cipher', 'Voss'];

const roles = ['Full Stack Developer', 'Data Scientist', 'AI Researcher', 'UX Designer', 'Product Manager', 'Cybersecurity Analyst', 'Blockchain Architect', 'Cloud Engineer'];
const companies = ['Google', 'OpenAI', 'Anthropic', 'Meta', 'Netflix', 'Stripe', 'Replit', 'SpaceX', 'Tesla', 'Nvidia', 'Stealth Startup', 'DAO Collective'];

const skillsList = ['React', 'Python', 'TensorFlow', 'Rust', 'Go', 'Kubernetes', 'Design Systems', 'NLP', 'Computer Vision', 'Smart Contracts', 'GraphQL', 'AWS'];

// Journey milestone templates for exceptional candidates
const milestoneTemplates = [
  { year: 2015, event: 'Founded first tech startup at age 19', category: 'founder' },
  { year: 2016, event: 'Organized the first blockchain hackathon in the region', category: 'leadership' },
  { year: 2017, event: 'Published groundbreaking research on distributed systems', category: 'research' },
  { year: 2018, event: 'Built a peer-to-peer network reaching 100K nodes', category: 'engineering' },
  { year: 2019, event: 'Led a team that shipped product to 1M users', category: 'leadership' },
  { year: 2020, event: 'Developed proprietary behavioral science software from scratch', category: 'innovation' },
  { year: 2021, event: 'Acquired by major tech company', category: 'founder' },
  { year: 2022, event: 'Keynote speaker at global AI conference', category: 'thought_leader' },
  { year: 2023, event: 'Launched AI platform with 80% efficiency gains over competitors', category: 'innovation' },
  { year: 2024, event: 'Published bestselling book on technology leadership', category: 'thought_leader' },
];

const exceptionalTraits = [
  'First-mover in emerging technology domains',
  'Pattern of identifying opportunities before mainstream adoption',
  'Track record of shipping products at scale',
  'Demonstrated ability to build and lead high-performing teams',
  'Cross-disciplinary expertise spanning technical and business domains',
  'Published author or recognized thought leader',
  'Built systems serving millions of users',
  'Pioneer in applying research methodologies to practical problems',
  'Consistent history of exceeding performance benchmarks',
  'Rare combination of deep technical skill and strategic vision',
];

const journeyNarratives = [
  "Distinguished themselves early by building production systems while peers were still learning fundamentals. Demonstrated a rare ability to see around corners, consistently positioning themselves at the forefront of emerging technology waves before they hit mainstream.",
  "Took an unconventional path—applying ethnographic research to engineering problems, leading to breakthrough products that competitors couldn't replicate. Their interdisciplinary approach became their signature advantage.",
  "Rose from contributor to leader by shipping what others said was impossible. Built systems that scaled 100x beyond original specs, earning trust that led to founding their own ventures.",
  "Became known as the person who makes things happen. Organized industry-first events, published influential work, and built networks that others only talk about. Their impact extends far beyond their direct work.",
  "Balanced extraordinary professional output with a demanding personal life, demonstrating time management and execution abilities that set them apart from typical high performers.",
];

// Define organizations with relative weights/masses (xAI is largest)
const locations = [
  { name: 'xAI', weight: 0.25 }, 
  { name: 'OpenAI', weight: 0.18 },     
  { name: 'Anthropic', weight: 0.15 },        
  { name: 'Meta', weight: 0.12 },     
  { name: 'Google (DeepMind)', weight: 0.12 },       
  { name: 'Google Gemini', weight: 0.10 },
  { name: 'Nvidia', weight: 0.08 },       
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomLocation() {
  const rand = Math.random();
  let cumulativeWeight = 0;
  for (const loc of locations) {
    cumulativeWeight += loc.weight;
    if (rand < cumulativeWeight) {
      return loc.name;
    }
  }
  return locations[0].name; // Fallback
}

export interface JourneyMilestone {
  year: number;
  event: string;
  category: 'founder' | 'leadership' | 'research' | 'engineering' | 'innovation' | 'thought_leader';
}

export interface NodeData {
  id: string;
  name: string;
  role: string;
  company: string;
  img: string;
  exceptional: boolean;
  skills: string[];
  psychographic: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    innovationScore: number;
    leadershipPotential: number;
  };
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    website: string;
  };
  yearsExperience: number;
  location: string;
  clusterGroup: number;
  // New fields for journey/synthesis
  journey: {
    milestones: JourneyMilestone[];
    narrative: string;
    exceptionalTraits: string[];
  };
}

// Featured profiles - real people with synthetic data (to be updated later)
const featuredProfiles = [
  { name: 'Ian Pilon', location: 'xAI', role: 'AI Researcher' },
  { name: 'Elon Musk', location: 'xAI', role: 'CEO' },
  { name: 'Amitav Krishna', location: 'xAI', role: 'Data Scientist' },
  { name: 'William Suriaputra', location: 'OpenAI', role: 'Full Stack Developer' },
  { name: 'Prabal Gupta', location: 'Anthropic', role: 'Blockchain Architect' },
  { name: 'Eden Chan', location: 'Meta', role: 'UX Designer' },
  { name: 'Umesh Khanna', location: 'Google (DeepMind)', role: 'Cloud Engineer' },
];

function createFeaturedNode(profile: { name: string; location: string; role: string }, index: number): NodeData {
  const locationIdx = locations.findIndex(l => l.name === profile.location);
  const nameParts = profile.name.split(' ');
  const fn = nameParts[0];
  const ln = nameParts.slice(1).join('');
  
  // All featured profiles are exceptional with full milestones
  const shuffledMilestones = [...milestoneTemplates].sort(() => Math.random() - 0.5);
  const selectedMilestones = shuffledMilestones.slice(0, 6).sort((a, b) => a.year - b.year);
  
  const shuffledTraits = [...exceptionalTraits].sort(() => Math.random() - 0.5);
  const selectedTraits = shuffledTraits.slice(0, 4);

  return {
    id: `vip${index}`,
    name: profile.name,
    role: profile.role,
    company: randomItem(companies),
    img: randomItem(avatars),
    exceptional: true,
    skills: Array.from({ length: 5 }, () => randomItem(skillsList)),
    psychographic: {
      openness: randomInt(85, 100),
      conscientiousness: randomInt(80, 100),
      extraversion: randomInt(60, 95),
      agreeableness: randomInt(70, 95),
      neuroticism: randomInt(10, 30),
      innovationScore: randomInt(92, 100),
      leadershipPotential: randomInt(85, 100),
    },
    social: {
      github: `github.com/${fn.toLowerCase()}${ln.toLowerCase()}`,
      linkedin: `linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}`,
      twitter: `@${fn.toLowerCase()}_tech`,
      website: `${fn.toLowerCase()}.dev`,
    },
    yearsExperience: randomInt(8, 20),
    location: profile.location,
    clusterGroup: locationIdx >= 0 ? locationIdx : 0,
    journey: {
      milestones: selectedMilestones as JourneyMilestone[],
      narrative: randomItem(journeyNarratives),
      exceptionalTraits: selectedTraits,
    },
  };
}

export function generateGraphData(count: number = 1000) {
  const nodes: NodeData[] = [];
  const links: { source: string; target: string }[] = [];

  // Add featured profiles first
  featuredProfiles.forEach((profile, idx) => {
    nodes.push(createFeaturedNode(profile, idx));
  });

  // Generate remaining random nodes
  const remainingCount = count - featuredProfiles.length;
  for (let i = 0; i < remainingCount; i++) {
    const nodeIndex = i + featuredProfiles.length; // Offset index for unique IDs
    const isExceptional = Math.random() > 0.85; // Top 15%
    const fn = randomItem(firstNames);
    const ln = randomItem(lastNames);
    const location = getRandomLocation();
    
    // Assign a cluster group ID based on location index
    const locationIdx = locations.findIndex(l => l.name === location);

    // Generate journey data
    const numMilestones = isExceptional ? randomInt(4, 7) : randomInt(1, 3);
    const shuffledMilestones = [...milestoneTemplates].sort(() => Math.random() - 0.5);
    const selectedMilestones = shuffledMilestones.slice(0, numMilestones).sort((a, b) => a.year - b.year);
    
    const numTraits = isExceptional ? randomInt(3, 5) : randomInt(1, 2);
    const shuffledTraits = [...exceptionalTraits].sort(() => Math.random() - 0.5);
    const selectedTraits = shuffledTraits.slice(0, numTraits);

    nodes.push({
      id: `u${nodeIndex}`,
      name: `${fn} ${ln}`,
      role: randomItem(roles),
      company: randomItem(companies),
      img: randomItem(avatars),
      exceptional: isExceptional,
      skills: Array.from({ length: randomInt(3, 6) }, () => randomItem(skillsList)),
      psychographic: {
        openness: randomInt(60, 100),
        conscientiousness: randomInt(50, 100),
        extraversion: randomInt(20, 90),
        agreeableness: randomInt(40, 90),
        neuroticism: randomInt(10, 60),
        innovationScore: isExceptional ? randomInt(90, 100) : randomInt(50, 90),
        leadershipPotential: randomInt(10, 100),
      },
      social: {
        github: `github.com/${fn.toLowerCase()}${ln.toLowerCase()}`,
        linkedin: `linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}`,
        twitter: `@${fn.toLowerCase()}_tech`,
        website: `${fn.toLowerCase()}.dev`,
      },
      yearsExperience: randomInt(1, 15),
      location: location,
      clusterGroup: locationIdx,
      journey: {
        milestones: selectedMilestones as JourneyMilestone[],
        narrative: isExceptional ? randomItem(journeyNarratives) : "Shows steady progression with consistent performance across core competencies.",
        exceptionalTraits: selectedTraits,
      },
    });
  }

  // 2. Generate Links (Prefer intra-cluster connections)
  // We'll iterate through nodes and connect them
  nodes.forEach((node, i) => {
    // Determine how many connections this node has
    // Exceptional nodes might have more connections
    const numLinks = node.exceptional ? randomInt(3, 8) : randomInt(1, 4);

    for (let j = 0; j < numLinks; j++) {
      let targetIndex;
      const stayInCluster = Math.random() > 0.05; // 95% chance to stay in cluster (increased from 85%)

      if (stayInCluster) {
        // Find a random node in the same location
        let attempts = 0;
        do {
           targetIndex = randomInt(0, nodes.length - 1);
           attempts++;
        } while (nodes[targetIndex].location !== node.location && attempts < 20);
      } else {
        // Connect to anywhere (bridge between clusters)
        targetIndex = randomInt(0, nodes.length - 1);
      }

      if (targetIndex !== i) {
        // Check if link already exists (simple string check or just push and let graph handle dupes)
        // ForceGraph handles dupes usually, but cleaner to not have self-loops
        links.push({
          source: node.id,
          target: nodes[targetIndex].id,
        });
      }
    }
  });

  return { nodes, links };
}
