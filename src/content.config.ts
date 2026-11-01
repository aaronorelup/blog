// Collections → schemas (src/schemas/). entry.id is the file name, which is the URL slug.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { post } from './schemas/post';
import { note } from './schemas/note';
import { project } from './schemas/project';
import { research } from './schemas/research';

const dir = (d: string, pattern = '*.md') => glob({ base: `./src/content/${d}`, pattern });

export const collections = {
  posts: defineCollection({ loader: dir('posts'), schema: post }),       // /ledger/<file name>/
  notes: defineCollection({ loader: dir('notes'), schema: note }),       // /ledger/<file name>/notes/
  projects: defineCollection({ loader: dir('projects', '*.yaml'), schema: project }),
  research: defineCollection({ loader: dir('research'), schema: research }),
};
