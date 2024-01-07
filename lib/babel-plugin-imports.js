export default function BabelPluginDeterministicTestImports (babel) {
  const { types: t } = babel;

  let firstDescribe = null;
  return {
    name: 'deterministic-test-imports',
    visitor: {
      Program (path) {
        for (const child of path.get('body')) {
          if (!child.isExpressionStatement()) continue;
          if (!child.get('expression').isCallExpression()) continue;
          if (!child.get('expression.callee').isIdentifier({ name: 'describe' })) continue;
          firstDescribe = child;
          break;
        }
      },
      ImportDeclaration (path) {
        const { specifiers, source } = path.node;

        const props = specifiers.map((node) => {
          if (node.type === 'ImportDefaultSpecifier') {
            return t.ObjectProperty(t.Identifier('default'), node.local);
          }
          if (node.type === 'ImportSpecifier') {
            return t.ObjectProperty(
              node.imported,
              node.local,
              false,
              node.imported.name === node.local.name
            );
          }
          return null;
        }).filter(Boolean);
        const decl = t.VariableDeclarator(
          t.ObjectPattern(props),
          t.AwaitExpression(
            t.CallExpression(t.Import(), [ source ])
          )
        );
        const dynaImport = t.VariableDeclaration('var', [ decl ]);
        if (firstDescribe) {
          path.remove();
          firstDescribe.insertBefore(dynaImport);
        } else {
          path.replaceWith(dynaImport);
        }
      },
    },
  };
}
