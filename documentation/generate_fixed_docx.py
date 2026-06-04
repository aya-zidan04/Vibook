#!/usr/bin/env python3
"""Regenerate Vibook Introduction docx by editing document.xml inside a copied template zip."""

from __future__ import annotations

import argparse
import re
import shutil
import sys
import zipfile
from copy import deepcopy
from pathlib import Path
from xml.etree import ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
DEFAULT_SOURCE = Path(
    "/Users/ayazidan/Downloads/Graduation Project TEMPLATE (1)-2.docx"
)
DEFAULT_OUTPUT = Path("Vibook_Introduction_FIXED.docx")

# Register Word namespace for readable output (not required for parsing).
ET.register_namespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")


def para_text(p: ET.Element) -> str:
    return "".join(t.text or "" for t in p.iter(f"{W}t")).strip()


def set_para_text(p: ET.Element, text: str) -> None:
    """Replace paragraph text while keeping pPr and the first run's rPr if present."""
    p_pr = p.find(f"{W}pPr")
    r_pr = None
    for child in list(p):
        if child.tag == f"{W}r":
            r_pr_elem = child.find(f"{W}rPr")
            if r_pr_elem is not None:
                r_pr = deepcopy(r_pr_elem)
            break
    for child in list(p):
        if child.tag != f"{W}pPr":
            p.remove(child)
    if text:
        r = ET.Element(f"{W}r")
        if r_pr is not None:
            r.append(r_pr)
        t = ET.SubElement(r, f"{W}t")
        if text.startswith(" ") or text.endswith(" "):
            t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        t.text = text
        p.append(r)


def clone_para(ref: ET.Element) -> ET.Element:
    return deepcopy(ref)


def find_style_ref(body: ET.Element, style_name: str) -> ET.Element | None:
    for p in body.iter(f"{W}p"):
        p_pr = p.find(f"{W}pPr")
        if p_pr is None:
            continue
        p_style = p_pr.find(f"{W}pStyle")
        if p_style is not None and p_style.get(f"{W}val") == style_name:
            return p
    return None


STYLE_IDS = {
    "Heading 2": "Heading2",
    "Heading 1": "Heading1",
    "s70": "s70",
    "s75": "s75",
    "s3": "s3",
    "Caption": "Caption",
    "InfoBlue": "InfoBlue",
    "Normal": "Normal",
}


def make_para(body: ET.Element, refs: dict[str, ET.Element], style: str, text: str) -> ET.Element:
    ref = refs.get(style) or refs.get("Normal") or next(body.iter(f"{W}p"))
    p = clone_para(ref)
    set_para_text(p, text)
    sid = STYLE_IDS.get(style)
    if sid:
        p_pr = p.find(f"{W}pPr")
        if p_pr is None:
            p_pr = ET.SubElement(p, f"{W}pPr")
        p_style = p_pr.find(f"{W}pStyle")
        if p_style is None:
            p_style = ET.SubElement(p_pr, f"{W}pStyle")
        p_style.set(f"{W}val", sid)
    return p


def build_sections():
    from fill_introduction import build_sections as _bs

    return _bs()


def chapter1_indices(body: ET.Element) -> tuple[int, int, int]:
    children = list(body)
    ch1 = intro = ch2 = None
    for i, el in enumerate(children):
        if el.tag != f"{W}p":
            continue
        t = para_text(el)
        if t == "Chapter 1":
            ch1 = i
        elif t == "Introduction" and ch1 is not None and intro is None:
            intro = i
        elif t == "Chapter 2" and intro is not None:
            ch2 = i
            break
    if ch1 is None or intro is None or ch2 is None:
        raise ValueError("Could not locate Chapter 1 / Introduction / Chapter 2 in document.xml")
    return ch1, intro, ch2


def first_table_in_range(body: ET.Element, start: int, end: int) -> ET.Element | None:
    children = list(body)
    for i in range(start, end):
        if children[i].tag == f"{W}tbl":
            return children[i]
    return None


def rebuild_chapter1(document_xml: bytes, table_updates: list[tuple[int, list[str]]]) -> bytes:
    root = ET.fromstring(document_xml)
    body = root.find(f"{W}body")
    if body is None:
        raise ValueError("Missing w:body")

    refs: dict[str, ET.Element] = {}
    for style, sid in STYLE_IDS.items():
        found = find_style_ref(body, sid)
        if found is not None:
            refs[style] = found

    ch1, intro, ch2 = chapter1_indices(body)
    children = list(body)
    timeline_tbl = first_table_in_range(body, ch1, ch2)

    # Remove everything after Introduction up to Chapter 2 (keep Chapter 1 title block).
    for el in children[intro + 1 : ch2]:
        body.remove(el)

    anchor_idx = list(body).index(children[intro])

    def append_after_anchor(p: ET.Element) -> ET.Element:
        nonlocal anchor_idx
        body.insert(anchor_idx + 1, p)
        anchor_idx += 1
        return p

    for heading, body_style, body_text in build_sections():
        append_after_anchor(make_para(body, refs, "Heading 2", heading))
        if heading == "Tasks":
            for part in body_text.split("\n\n"):
                append_after_anchor(make_para(body, refs, body_style, part))
            append_after_anchor(make_para(body, refs, "s75", "Table 1 Project Timeline"))
            append_after_anchor(make_para(body, refs, "s3", ""))
            if timeline_tbl is not None:
                append_after_anchor(timeline_tbl)
            append_after_anchor(make_para(body, refs, "Caption", "Table 1 Project Timeline"))
            append_after_anchor(
                make_para(
                    body,
                    refs,
                    "s70",
                    "Table 1 lists the work breakdown structure, schedule, and completion status for major Vibook "
                    "delivery tasks from requirements through documentation.",
                )
            )
            continue
        for part in body_text.split("\n\n"):
            style = "InfoBlue" if part.strip().startswith("[PLACEHOLDER:") else body_style
            append_after_anchor(make_para(body, refs, style, part))

    append_after_anchor(make_para(body, refs, "Normal", ""))
    append_after_anchor(
        make_para(
            body,
            refs,
            "InfoBlue",
            "[PLACEHOLDER: Figure 1.3 - Vibook Use Case Diagram]\n"
            "Description: Show actors Guest, Consumer (USER), Business Partner, and Admin interacting with "
            "use cases Discover Events, Book Event, Manage Business Profile, Publish Event, Moderate Content, "
            "and View Analytics based on implemented mobile and admin flows.",
        )
    )
    append_after_anchor(make_para(body, refs, "Normal", ""))
    append_after_anchor(make_para(body, refs, "Caption", "Figure 1.3 Vibook Use Case Diagram"))
    append_after_anchor(
        make_para(
            body,
            refs,
            "InfoBlue",
            "Figure 1.3 illustrates primary interactions between Vibook actors and the implemented booking, "
            "partner onboarding, and administration capabilities. Replace the placeholder with the project-specific "
            "diagram before submission.",
        )
    )

    # Update first table in document (timeline) if present.
    tbl = body.find(f".//{W}tbl")
    if tbl is not None and table_updates:
        rows = tbl.findall(f"{W}tr")
        for ri, row_vals in enumerate(table_updates):
            if ri >= len(rows):
                break
            cells = rows[ri].findall(f"{W}tc")
            for ci, val in enumerate(row_vals):
                if ci >= len(cells):
                    break
                ps = cells[ci].findall(f"{W}p")
                if ps:
                    set_para_text(ps[0], val)

    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def patch_docx(source: Path, output: Path) -> None:
    table_rows = [
        ("WBS", "Task description", "Start date", "Finish date", "Progress"),
        ("1", "Requirements analysis and domain modeling for event booking in Jordan", "Sep 2024", "Oct 2024", "100%"),
        ("2", "System architecture and database design (MySQL, REST API)", "Oct 2024", "Nov 2024", "100%"),
        ("3", "Backend implementation (Spring Boot, JWT, JPA entities)", "Nov 2024", "Feb 2025", "100%"),
        ("4", "Mobile app implementation (Expo, consumer and partner flows)", "Jan 2025", "Apr 2025", "100%"),
        ("5", "Admin web console and integration testing", "Mar 2025", "May 2025", "100%"),
        ("6", "Documentation, UAT, and graduation report preparation", "May 2025", "Jun 2025", "90%"),
    ]

    new_document = None
    with zipfile.ZipFile(source, "r") as zin:
        new_document = rebuild_chapter1(zin.read("word/document.xml"), table_rows)
        with zipfile.ZipFile(output, "w") as zout:
            for info in zin.infolist():
                data = (
                    new_document
                    if info.filename == "word/document.xml"
                    else zin.read(info.filename)
                )
                zout.writestr(info, data)


def validate_docx(path: Path) -> list[str]:
    issues: list[str] = []
    try:
        with zipfile.ZipFile(path, "r") as zf:
            bad = zf.testzip()
            if bad:
                issues.append(f"Zip integrity failure at {bad}")
            for name in zf.namelist():
                if name.endswith((".xml", ".rels")):
                    ET.fromstring(zf.read(name))
            xml = zf.read("word/document.xml").decode("utf-8")
    except zipfile.BadZipFile:
        return [f"Not a valid zip/docx: {path}"]

    no_tbl = re.sub(r"<w:tbl>.*?</w:tbl>", "", xml, flags=re.S)
    bare = len(re.findall(r"<w:p>(?!\s*<w:pPr)", no_tbl))
    if bare:
        issues.append(f"{bare} body paragraph(s) missing w:pPr")
    if xml.count("bookmarkStart") != xml.count("bookmarkEnd"):
        issues.append("Unbalanced bookmarkStart/bookmarkEnd counts")
    return issues


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    if not args.source.is_file():
        print(f"Source not found: {args.source}", file=sys.stderr)
        return 1

    patch_docx(args.source, args.output)
    issues = validate_docx(args.output)
    if issues:
        print("Validation failed:", file=sys.stderr)
        for issue in issues:
            print(f"  - {issue}", file=sys.stderr)
        return 1

    print(f"Wrote {args.output} ({args.output.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
