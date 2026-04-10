import prisma from '../lib/prisma';

interface DataDragonChampion {
  id: string;       // riotKey e.g. "Ahri", "MonkeyKing"
  key: string;      // numeric ID as string e.g. "103"
  name: string;     // display name e.g. "Ahri", "Wukong"
  title: string;
  tags: string[];
  image: { full: string };
}

async function getLatestVersion(): Promise<string> {
  const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions = await res.json() as string[];
  return versions[0];
}

export async function syncChampions(): Promise<number> {
  const version = await getLatestVersion();
  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
  );
  const data = await res.json() as { data: Record<string, DataDragonChampion> };
  const champions = Object.values(data.data);

  for (const champ of champions) {
    await prisma.champion.upsert({
      where: { riotKey: champ.id },
      update: {
        name: champ.name,
        title: champ.title,
        tags: champ.tags,
        imageUrl: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.image.full}`,
        version,
      },
      create: {
        riotKey: champ.id,
        riotId: parseInt(champ.key, 10),
        name: champ.name,
        title: champ.title,
        tags: champ.tags,
        imageUrl: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.image.full}`,
        version,
      },
    });
  }

  return champions.length;
}
