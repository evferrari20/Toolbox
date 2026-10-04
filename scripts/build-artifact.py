#!/usr/bin/env python3
"""Builds a self-contained copy of the site for hosts that only serve web data types
(e.g. a claude.ai Artifact). Binary .glb/.hdr assets are wrapped as base64 JSON, and the
page is written without <html>/<head>/<body> wrappers.

Usage: python3 scripts/build-artifact.py [outdir]   (default: dist/artifact)
"""
import base64, json, os, re, shutil, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, 'dist', 'artifact'))
shutil.rmtree(out, ignore_errors=True)
for d in ('css', 'js'):
    shutil.copytree(os.path.join(root, d), os.path.join(out, d))
for dirpath, _, files in os.walk(os.path.join(root, 'assets')):
    for f in files:
        src = os.path.join(dirpath, f)
        rel = os.path.relpath(src, root)
        dst = os.path.join(out, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if f.endswith(('.glb', '.hdr')):
            with open(src, 'rb') as fh:
                json.dump({'b64': base64.b64encode(fh.read()).decode()}, open(dst + '.json', 'w'))
        else:
            shutil.copy(src, dst)
html = open(os.path.join(root, 'index.html')).read()
head = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
body = re.search(r'<body>(.*?)</body>', html, re.S).group(1)
head = re.sub(r'<meta (charset|name="viewport")[^>]*>\n?', '', head)
body = body.replace('<script src="js/registry.js">', "<script>window.TB_ASSET_FORMAT = 'b64json';</script>\n<script src=\"js/registry.js\">", 1)
open(os.path.join(out, 'index.html'), 'w').write(head.strip() + '\n' + body.strip() + '\n')
files = sorted(os.path.relpath(os.path.join(dp, f), out) for dp, _, fs in os.walk(out) for f in fs if f != 'index.html')
json.dump([{'path': f} for f in files], open(os.path.join(out, 'files.json'), 'w'))
print(out, len(files), 'files')
