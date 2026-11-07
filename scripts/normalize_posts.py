#!/usr/bin/env python3
"""Normalize Obsidian-flavoured markdown in _posts/ so kramdown (GitHub Pages) renders it fully.

Idempotent. Usage: normalize_posts.py [files...]   (default: _posts/*.md)

Fixes:
  * tab-indented nested lists  -> 4-space indentation
  * <font color=..> / <mark ..> -> balanced <span style=..> (malformed/unclosed tags repaired per line)
  * missing blank lines before/after headings, before lists, tables
Fenced code blocks and front matter are left untouched.
"""
import re
import sys
import glob

LIST_RE = re.compile(r'^\s*([-*+]|\d+[.)])\s')
TAG_RE = re.compile(r'<(/?)(font|mark)\b([^>]*)>', re.I)
FENCE_RE = re.compile(r'^\s*(```|~~~)')


def convert_tags(line):
    if '<font' not in line.lower() and '<mark' not in line.lower() and '</font' not in line.lower() and '</mark' not in line.lower():
        return line
    out, stack, pos = [], 0, 0
    for m in TAG_RE.finditer(line):
        out.append(line[pos:m.start()])
        pos = m.end()
        closing, name, attrs = m.group(1), m.group(2).lower(), m.group(3)
        if closing:
            if stack:
                stack -= 1
                out.append('</span>')
            continue
        if name == 'font':
            c = re.search(r'color\s*=\s*"([^"]*)"', attrs)
            style = 'color: %s' % c.group(1) if c else ''
        else:
            c = re.search(r'background\s*:\s*(#[0-9a-fA-F]{3,8})', attrs)
            style = 'background: %s' % (c.group(1) if c else '#fff88f')
        # an empty "<mark style=..></mark>" directly after an opener is junk from Obsidian
        if name == 'mark' and line[pos:pos + 7].lower() == '</mark>' and stack == 0 and attrs.strip():
            pos += 7
            continue
        stack += 1
        out.append('<span style="%s">' % style if style else '<span>')
    out.append(line[pos:])
    out.append('</span>' * stack)
    return ''.join(out)


def fix_indent(line):
    m = re.match(r'^([ \t]*)(.*)$', line)
    ws, rest = m.group(1), m.group(2)
    if '\t' not in ws:
        return line
    tabs, spaces = ws.count('\t'), ws.replace('\t', '')
    if LIST_RE.match(rest + ' ') and len(spaces) <= 1:
        spaces = ''
    return ' ' * (4 * tabs) + spaces + rest


def normalize(text):
    lines = text.split('\n')
    # front matter
    i = 0
    if lines and lines[0].strip() == '---':
        i = 1
        while i < len(lines) and lines[i].strip() != '---':
            i += 1
        i += 1
    head, body = lines[:i], lines[i:]
    out, in_code = [], False
    for l in body:
        if FENCE_RE.match(l):
            in_code = not in_code
            if in_code and out and out[-1].strip():
                out.append('')
            out.append(l)
            continue
        if in_code:
            out.append(l)
            continue
        l = convert_tags(fix_indent(l)).rstrip() if l.strip() else ''
        prev = out[-1] if out else ''
        is_head = bool(re.match(r'^#{1,6}\s', l))
        is_list = bool(LIST_RE.match(l))
        is_table = l.lstrip().startswith('|')
        prev_list = bool(LIST_RE.match(prev)) or prev.startswith((' ', '\t'))
        prev_table = prev.lstrip().startswith('|')
        if prev.strip() and (is_head or (is_list and not prev_list and not LIST_RE.match(prev))
                             or (is_table and not prev_table)):
            out.append('')
        if re.match(r'^#{1,6}\s', prev) and l.strip():
            out.append('')
        if prev_table and l.strip() and not is_table:
            out.append('')
        out.append(l)
    res = re.sub(r'\n{3,}', '\n\n', '\n'.join(out))
    prefix = '\n'.join(head) + '\n\n' if head else ''
    return prefix + res.strip('\n') + '\n'


def main():
    files = sys.argv[1:] or sorted(glob.glob('_posts/*.md'))
    changed = 0
    for f in files:
        s = open(f, encoding='utf-8').read()
        n = normalize(s)
        if n != s:
            open(f, 'w', encoding='utf-8').write(n)
            changed += 1
            print('normalized', f)
    print('%d file(s) changed' % changed)


if __name__ == '__main__':
    main()
