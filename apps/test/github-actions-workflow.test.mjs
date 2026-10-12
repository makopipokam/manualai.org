import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('GitHub Actions Workflow for GitHub Pages Deployment', () => {
  const root = process.cwd();
  const workflowPath = path.join(root, '.github', 'workflows', 'deploy.yml');

  it('workflow file exists at .github/workflows/deploy.yml', () => {
    assert.ok(fs.existsSync(workflowPath), 'Workflow file .github/workflows/deploy.yml must exist');
  });

  it('triggers on push to the main branch and workflow_dispatch', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    assert.ok(content.includes('push:'), 'Workflow should listen to push events');
    assert.ok(content.includes('branches:') && content.includes('main'), 'Workflow must target main branch');
    assert.ok(content.includes('workflow_dispatch:'), 'Workflow should support manual dispatch');
  });

  it('specifies required GitHub Pages permissions (pages: write, id-token: write)', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    assert.ok(content.includes('pages: write'), 'Workflow must grant pages: write permission');
    assert.ok(content.includes('id-token: write'), 'Workflow must grant id-token: write permission');
    assert.ok(content.includes('contents: read'), 'Workflow must grant contents: read permission');
  });

  it('uses official GitHub Pages actions (configure-pages, upload-pages-artifact, deploy-pages)', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    assert.ok(content.includes('actions/configure-pages'), 'Must use actions/configure-pages');
    assert.ok(content.includes('actions/upload-pages-artifact'), 'Must use actions/upload-pages-artifact');
    assert.ok(content.includes('actions/deploy-pages'), 'Must use actions/deploy-pages');
    assert.ok(content.includes('actions/checkout'), 'Must use actions/checkout');
  });

  it('runs automated test verification before deployment', () => {
    const content = fs.readFileSync(workflowPath, 'utf8');
    assert.ok(content.includes('npm test'), 'Workflow should run npm test to ensure build quality');
    assert.ok(content.includes('needs: test'), 'Deploy job should depend on test job');
  });

  it('repository includes .nojekyll to disable Jekyll processing for static assets', () => {
    const nojekyllPath = path.join(root, '.nojekyll');
    assert.ok(fs.existsSync(nojekyllPath), '.nojekyll file must exist in repository root');
  });
});
