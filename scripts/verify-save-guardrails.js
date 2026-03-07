#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const featuresRoot = path.join(projectRoot, 'src', 'features');

function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  const screenOrFormPattern = /(Form|form|Screen|screen)\.(ts|tsx|js|jsx)$/;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
      continue;
    }

    if (entry.isFile() && screenOrFormPattern.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function findViolations(filePath, content) {
  const violations = [];
  const relativePath = path.relative(projectRoot, filePath);

  if (content.includes('navigation.goBack(')) {
    violations.push(
      `${relativePath}: direct navigation.goBack() detected. Use safeCloseAfterMutation() for feature screen close paths.`,
    );
  }

  const onSubmitFinallyPattern =
    /const\s+onSubmit\s*=\s*async[\s\S]*?finally\s*\{[\s\S]*?setIsLoading\(false\)/m;

  if (onSubmitFinallyPattern.test(content)) {
    violations.push(
      `${relativePath}: onSubmit contains finally { setIsLoading(false) } which violates guarded save-close flow.`,
    );
  }

  return violations;
}

if (!fs.existsSync(featuresRoot)) {
  console.error('Could not find src/features directory.');
  process.exit(1);
}

const files = listFiles(featuresRoot);
const violations = [];

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  violations.push(...findViolations(filePath, content));
}

if (violations.length > 0) {
  console.error('Save flow guardrail violations found:\n');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log('Save flow guardrails passed.');
