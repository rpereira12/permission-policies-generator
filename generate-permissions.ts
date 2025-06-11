import fs from 'fs';
import path from 'path';

const permissionsFile = path.resolve(__dirname, 'permissions.json');
const tsOutputFile = path.resolve(__dirname, 'frontend', 'permissions.ts');
const csOutputFile = path.resolve(__dirname, 'backend', 'Permissions.cs');

const permissions = JSON.parse(fs.readFileSync(permissionsFile, 'utf-8')) as Record<string, string[]>;

// (frontend)
const tsFile = `// Auto-generated. Do not edit manually.\n\n` +
  `const defaultPermissions = {\n` +
  Object.entries(permissions)
    .map(([group, perms]) => {
      const items = perms.map(p => `    "${p}"`).join(',\n');
      return `  ${group}: [\n${items}\n  ]`;
    })
    .join(',\n') +
  `\n};\n\nexport default defaultPermissions;\n`;

fs.writeFileSync(tsOutputFile, tsFile);
console.log('permissions.ts atualizado com sucesso.');

// (backend)
const csFile =
  `// Auto-generated. Do not edit manually.\n` +
  `namespace Shared.Permissions\n{\n` +
  `    public static class Permissions\n    {\n` +
  Object.entries(permissions)
    .map(([group, perms]) => {
      const props = perms
        .map(perm => {
          const [entity, action] = perm.split(':');
          if (!entity || !action) return null;
          return `            public const string ${sanitize(toPascal(action))} = "${perm}";`;
        })
        .filter(Boolean)
        .join('\n');
      return `        public static class ${sanitize(group)}\n        {\n${props}\n        }`;
    })
    .join('\n\n') +
  `\n    }\n}\n`;

fs.writeFileSync(csOutputFile, csFile);
console.log('Permissions.cs atualizado com sucesso.');

// Utils
function toPascal(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sanitize(str: string) {
  return str.replace(/[^a-zA-Z0-9_]/g, '');
}
