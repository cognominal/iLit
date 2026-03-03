export type TsSceneEntry = {
  id: string;
  title: string;
  description: string;
};

export type TsScriptEntry = {
  id: string;
  title: string;
  source: string;
  scenes: TsSceneEntry[];
};

export const tsScripts: TsScriptEntry[] = [
  {
    id: 'mobjects_basics',
    title: '01 Mobjects Basics',
    source: 'app/src/lib/ts-feature-sweep/scenes/mobjectsBasics.ts',
    scenes: [
      {
        id: 'basics_layout',
        title: 'Basics Layout',
        description: 'Square, circle, and title from TS scene source.'
      }
    ]
  }
];

export function findTsScript(scriptId: string): TsScriptEntry | undefined {
  return tsScripts.find((script) => script.id === scriptId);
}

export function findTsScene(
  scriptId: string,
  sceneId: string
): TsSceneEntry | undefined {
  return findTsScript(scriptId)?.scenes.find((scene) => scene.id === sceneId);
}
