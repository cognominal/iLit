import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import ts from 'typescript';

const TRACKED_MOBJECT_FACTORIES = new Set([
  'Arc',
  'Arrow',
  'Axes',
  'Brace',
  'BulletedList',
  'Circle',
  'Cross',
  'CubicBezier',
  'Dot',
  'Ellipse',
  'Line',
  'MarkupText',
  'MathTex',
  'Paragraph',
  'Path',
  'Polygon',
  'Rectangle',
  'RegularPolygon',
  'RoundedRectangle',
  'SVGMobject',
  'Sphere',
  'Square',
  'SurroundingRectangle',
  'Tex',
  'Text',
  'ThreeDAxes',
  'Title',
  'TitleText',
  'Triangle',
  'Underline',
  'Vector',
  'VGroup',
]);

function isAuthoredSceneModule(id: string): boolean {
  const normalized = id.replace(/\\/g, '/');
  if (normalized.includes('?')) return false;
  if (!normalized.endsWith('.ts')) return false;
  return normalized.includes('/src/lib/ts-feature-sweep/ts/') ||
    normalized.includes('/src/lib/dlxn/scenes/');
}

function createAttachImport(factory: typeof ts.factory): ts.Statement {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(
          false,
          undefined,
          factory.createIdentifier('__attachMobjectSource')
        )
      ])
    ),
    factory.createStringLiteral('$lib/manim-source'),
    undefined
  );
}

function isTrackedFactoryCall(
  expression: ts.Expression,
  importedFactories: Set<string>
): boolean {
  return ts.isIdentifier(expression) && importedFactories.has(expression.text);
}

function isTrackedMethodCall(expression: ts.Expression): boolean {
  return (
    (ts.isPropertyAccessExpression(expression) ||
      ts.isPropertyAccessChain(expression)) &&
    expression.name.text === 'plot'
  );
}

function collectTrackedFactories(sourceFile: ts.SourceFile): {
  importedFactories: Set<string>;
  hasAttachImport: boolean;
} {
  const importedFactories = new Set<string>();
  let hasAttachImport = false;

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const moduleName = ts.isStringLiteral(statement.moduleSpecifier)
      ? statement.moduleSpecifier.text
      : '';
    if (
      moduleName === '$lib/manim-source' &&
      statement.importClause?.namedBindings &&
      ts.isNamedImports(statement.importClause.namedBindings)
    ) {
      for (const element of statement.importClause.namedBindings.elements) {
        if (element.name.text === '__attachMobjectSource') {
          hasAttachImport = true;
        }
      }
    }
    if (
      moduleName !== '$lib/manim' &&
      moduleName !== '$lib/manim-api'
    ) {
      continue;
    }
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      const importedName = element.propertyName?.text ?? element.name.text;
      if (TRACKED_MOBJECT_FACTORIES.has(importedName)) {
        importedFactories.add(element.name.text);
      }
    }
  }

  return { importedFactories, hasAttachImport };
}

export function manimSourceIdPlugin(): Plugin {
  const appDir = fileURLToPath(new URL('..', import.meta.url));
  const repoRoot = join(appDir, '..');

  return {
    name: 'manim-source-id',
    enforce: 'pre',
    transform(code, id) {
      if (!isAuthoredSceneModule(id)) {
        return null;
      }

      const sourceFile = ts.createSourceFile(
        id,
        code,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
      );
      const { importedFactories, hasAttachImport } =
        collectTrackedFactories(sourceFile);

      if (importedFactories.size === 0) {
        return null;
      }

      const normalizedFile = relative(repoRoot, id).replace(/\\/g, '/');
      let changed = false;

      const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
        const { factory } = context;

        const visitor = (node: ts.Node): ts.Node => {
          if (ts.isCallExpression(node)) {
            const visited = ts.visitEachChild(
              node,
              visitor,
              context
            ) as ts.CallExpression;
            if (
              isTrackedFactoryCall(node.expression, importedFactories) ||
              isTrackedMethodCall(node.expression)
            ) {
              const start = node.getStart(sourceFile);
              const location =
                sourceFile.getLineAndCharacterOfPosition(start);
              changed = true;
              return factory.createCallExpression(
                factory.createIdentifier('__attachMobjectSource'),
                undefined,
                [
                  visited,
                  factory.createObjectLiteralExpression([
                    factory.createPropertyAssignment(
                      'file',
                      factory.createStringLiteral(normalizedFile)
                    ),
                    factory.createPropertyAssignment(
                      'line',
                      factory.createNumericLiteral(location.line + 1)
                    ),
                    factory.createPropertyAssignment(
                      'column',
                      factory.createNumericLiteral(location.character + 1)
                    )
                  ], true)
                ]
              );
            }
            return visited;
          }
          return ts.visitEachChild(node, visitor, context);
        };

        return (node) => {
          const visited = ts.visitNode(node, visitor) as ts.SourceFile;
          if (!changed || hasAttachImport) {
            return visited;
          }
          return factory.updateSourceFile(
            visited,
            [createAttachImport(factory), ...visited.statements]
          );
        };
      };

      const result = ts.transform(sourceFile, [transformer]);
      const transformed = result.transformed[0];
      result.dispose();

      if (!changed) {
        return null;
      }

      const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
      });
      return {
        code: printer.printFile(transformed),
        map: null,
      };
    }
  };
}
