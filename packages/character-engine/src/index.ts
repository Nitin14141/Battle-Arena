import { prisma } from "@battle-arena/database";

export const CharacterService = {
  async search(query: string) {
    return prisma.character.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { universe: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: { versions: true }
    });
  },

  async getProfile(id: string) {
    return prisma.character.findUnique({
      where: { id },
      include: {
        versions: {
          include: {
            attributes: true,
            abilities: true,
            feats: true
          }
        }
      }
    });
  }
};
