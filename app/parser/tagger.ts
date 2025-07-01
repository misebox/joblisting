import { db, tags, entryTags, entries } from '@/db';
import { eq } from 'drizzle-orm';

const TECH_KEYWORDS = {
  language: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift',
    'Kotlin', 'Scala', 'C++', 'C', 'HTML', 'CSS', 'SQL', 'Shell', 'Bash'
  ],
  framework: [
    'React', 'Vue.js', 'Vue', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'Django', 'Flask',
    'FastAPI', 'Express', 'Nest.js', 'Hono', 'Laravel', 'Symphony', 'Spring', 'Rails',
    'ASP.NET', '.NET', 'Gin', 'Echo', 'Actix'
  ],
  library: [
    'jQuery', 'Lodash', 'Axios', 'Redux', 'MobX', 'RxJS', 'Three.js', 'D3.js', 'Chart.js',
    'Material-UI', 'Ant Design', 'Bootstrap', 'Tailwind', 'Styled Components', 'Emotion'
  ],
  cloud: [
    'AWS', 'GCP', 'Google Cloud', 'Azure', 'Vercel', 'Netlify', 'Heroku', 'DigitalOcean',
    'Cloudflare', 'Firebase', 'Supabase'
  ],
  database: [
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'DynamoDB', 'Firestore',
    'Oracle', 'SQL Server', 'MariaDB', 'Cassandra', 'Elasticsearch'
  ],
  devops: [
    'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI',
    'Terraform', 'Ansible', 'Vagrant', 'Nginx', 'Apache'
  ]
};

export class TechTagger {
  private async ensureTag(name: string, category: string): Promise<number> {
    // Check if tag exists
    const [existingTag] = await db
      .select()
      .from(tags)
      .where(eq(tags.name, name))
      .limit(1);

    if (existingTag) {
      return existingTag.id;
    }

    // Create new tag
    const [newTag] = await db
      .insert(tags)
      .values({ name, category })
      .returning();

    return newTag.id;
  }

  private extractKeywords(text: string, keywords: string[]): string[] {
    const found: string[] = [];
    const normalizedText = text.toLowerCase();

    for (const keyword of keywords) {
      const normalizedKeyword = keyword.toLowerCase();
      // Word boundary check to avoid partial matches
      const regex = new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i');
      if (regex.test(normalizedText)) {
        found.push(keyword);
      }
    }

    return found;
  }

  async extractTags(entryText: string): Promise<{ name: string; category: string }[]> {
    const extractedTags: { name: string; category: string }[] = [];

    // Extract from all categories
    for (const [category, keywords] of Object.entries(TECH_KEYWORDS)) {
      const foundKeywords = this.extractKeywords(entryText, keywords);
      for (const keyword of foundKeywords) {
        extractedTags.push({ name: keyword, category });
      }
    }

    return extractedTags;
  }

  async tagEntry(entryId: number, entryData: {
    title: string;
    description?: string | null;
    requirements?: string | null;
    preferences?: string | null;
    techStack?: string | null;
  }): Promise<void> {
    // Combine all text fields for analysis
    const combinedText = [
      entryData.title,
      entryData.description,
      entryData.requirements,
      entryData.preferences,
      entryData.techStack
    ].filter(Boolean).join(' ');

    // Extract tags
    const extractedTags = await this.extractTags(combinedText);

    // Remove existing tags for this entry
    await db.delete(entryTags).where(eq(entryTags.entryId, entryId));

    // Add new tags
    for (const tagData of extractedTags) {
      const tagId = await this.ensureTag(tagData.name, tagData.category);
      await db.insert(entryTags).values({
        entryId,
        tagId
      });
    }
  }

  async tagAllEntries(): Promise<void> {
    const allEntries = await db.select().from(db.entries);
    
    console.log(`Tagging ${allEntries.length} entries...`);
    
    for (const entry of allEntries) {
      await this.tagEntry(entry.id, entry);
      console.log(`Tagged entry ${entry.id}: ${entry.title}`);
    }
    
    console.log('Tagging completed!');
  }
}