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
USE_CASE_IMAGE = Path(__file__).resolve().parent.parent / "docs" / "vibook-use-case-diagram.png"
USE_CASE_IMAGE_REL = "rIdVibookUseCase"
USE_CASE_IMAGE_TARGET = "media/vibook-use-case-diagram.png"
FIGURE_1_3_CAPTION = (
    "Figure 1.3 illustrates Vibook actors and use cases inside the Vibook Platform boundary. "
    "Guest users browse and view events without signing in. Consumer (USER) extends Guest with "
    "registration, booking, favorites, ratings, and reporting. Business Partner (BUSINESS) extends "
    "Consumer with profile application, event lifecycle management, photo uploads, and booking "
    "status updates. Administrator (ADMIN) governs profile approval, content moderation, report "
    "resolution, reference data, and analytics."
)

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


def make_image_para(
    body: ET.Element,
    refs: dict[str, ET.Element],
    rel_id: str,
    width_emu: int,
    height_emu: int,
    doc_pr_id: int = 9001,
) -> ET.Element:
    """Inline PNG paragraph for Word drawingML."""
    p = make_para(body, refs, "Normal", "")
    r = ET.SubElement(p, f"{W}r")
    drawing = ET.SubElement(r, f"{W}drawing")
    inline = ET.SubElement(
        drawing,
        "{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}inline",
    )
    inline.set("distT", "0")
    inline.set("distB", "0")
    inline.set("distL", "0")
    inline.set("distR", "0")
    extent = ET.SubElement(
        inline, "{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}extent"
    )
    extent.set("cx", str(width_emu))
    extent.set("cy", str(height_emu))
    doc_pr = ET.SubElement(
        inline, "{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}docPr"
    )
    doc_pr.set("id", str(doc_pr_id))
    doc_pr.set("name", "Figure 1.3 Use Case Diagram")
    cnv = ET.SubElement(
        inline,
        "{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}cNvGraphicFramePr",
    )
    ET.SubElement(
        cnv,
        "{http://schemas.openxmlformats.org/drawingml/2006/main}graphicFrameLocks",
        {"noChangeAspect": "1"},
    )
    graphic = ET.SubElement(inline, "{http://schemas.openxmlformats.org/drawingml/2006/main}graphic")
    graphic_data = ET.SubElement(
        graphic,
        "{http://schemas.openxmlformats.org/drawingml/2006/main}graphicData",
        {"uri": "http://schemas.openxmlformats.org/drawingml/2006/picture"},
    )
    pic = ET.SubElement(
        graphic_data, "{http://schemas.openxmlformats.org/drawingml/2006/picture}pic"
    )
    nv = ET.SubElement(pic, "{http://schemas.openxmlformats.org/drawingml/2006/picture}nvPicPr")
    ET.SubElement(
        nv, "{http://schemas.openxmlformats.org/drawingml/2006/picture}cNvPr", {"id": "0", "name": ""}
    )
    ET.SubElement(nv, "{http://schemas.openxmlformats.org/drawingml/2006/picture}cNvPicPr")
    blip_fill = ET.SubElement(
        pic, "{http://schemas.openxmlformats.org/drawingml/2006/picture}blipFill"
    )
    ET.SubElement(
        blip_fill,
        "{http://schemas.openxmlformats.org/drawingml/2006/main}blip",
        {"{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed": rel_id},
    )
    stretch = ET.SubElement(blip_fill, "{http://schemas.openxmlformats.org/drawingml/2006/main}stretch")
    ET.SubElement(stretch, "{http://schemas.openxmlformats.org/drawingml/2006/main}fillRect")
    sp_pr = ET.SubElement(pic, "{http://schemas.openxmlformats.org/drawingml/2006/picture}spPr")
    xfrm = ET.SubElement(sp_pr, "{http://schemas.openxmlformats.org/drawingml/2006/main}xfrm")
    ET.SubElement(xfrm, "{http://schemas.openxmlformats.org/drawingml/2006/main}off", {"x": "0", "y": "0"})
    ET.SubElement(
        xfrm,
        "{http://schemas.openxmlformats.org/drawingml/2006/main}ext",
        {"cx": str(width_emu), "cy": str(height_emu)},
    )
    ET.SubElement(
        sp_pr,
        "{http://schemas.openxmlformats.org/drawingml/2006/main}prstGeom",
        {"prst": "rect"},
    ).append(ET.Element("{http://schemas.openxmlformats.org/drawingml/2006/main}avLst"))
    return p


def image_emu_size(png_path: Path, width_inches: float = 6.4) -> tuple[int, int]:
    try:
        from PIL import Image

        with Image.open(png_path) as im:
            w, h = im.size
        height_inches = width_inches * (h / w)
    except Exception:
        height_inches = width_inches * 0.62
    emu_per_inch = 914400
    return int(width_inches * emu_per_inch), int(height_inches * emu_per_inch)


def add_image_relationship(rels_xml: bytes, rel_id: str, target: str) -> bytes:
    rel_ns = "http://schemas.openxmlformats.org/package/2006/relationships"
    root = ET.fromstring(rels_xml)
    for rel in root:
        if rel.get("Id") == rel_id:
            rel.set("Target", target)
            break
    else:
        rel = ET.SubElement(
            root,
            f"{{{rel_ns}}}Relationship",
            {
                "Id": rel_id,
                "Type": "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
                "Target": target,
            },
        )
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


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


def ensure_table_columns(tbl: ET.Element, num_cols: int) -> None:
    """Clone the last w:tc per row when the template has fewer columns."""
    for tr in tbl.findall(f"{W}tr"):
        cells = tr.findall(f"{W}tc")
        while len(cells) < num_cols:
            new_tc = deepcopy(cells[-1])
            tr.append(new_tc)
            cells.append(new_tc)


def first_table_in_range(body: ET.Element, start: int, end: int) -> ET.Element | None:
    children = list(body)
    for i in range(start, end):
        if children[i].tag == f"{W}tbl":
            return children[i]
    return None


def rebuild_chapter1(
    document_xml: bytes,
    table_updates: list[tuple[int, list[str]]],
    embed_use_case_image: bool = False,
    image_rel_id: str = USE_CASE_IMAGE_REL,
    image_emu: tuple[int, int] | None = None,
) -> bytes:
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
                    "Table 1 lists the work breakdown structure, schedule, WBS weights, and team assignments for major "
                    "Vibook delivery tasks from requirements through documentation.",
                )
            )
            continue
        for part in body_text.split("\n\n"):
            style = "InfoBlue" if part.strip().startswith("[PLACEHOLDER:") else body_style
            append_after_anchor(make_para(body, refs, style, part))

    append_after_anchor(make_para(body, refs, "Normal", ""))
    if embed_use_case_image and image_emu is not None:
        append_after_anchor(
            make_image_para(body, refs, image_rel_id, image_emu[0], image_emu[1])
        )
    append_after_anchor(make_para(body, refs, "Normal", ""))
    append_after_anchor(make_para(body, refs, "Caption", "Figure 1.3 Vibook Use Case Diagram"))
    append_after_anchor(make_para(body, refs, "s70", FIGURE_1_3_CAPTION))

    # Update first table in document (timeline) if present.
    tbl = body.find(f".//{W}tbl")
    if tbl is not None and table_updates:
        ensure_table_columns(tbl, len(table_updates[0]))
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
        (
            "WBS",
            "Task Description",
            "Start Date",
            "Finish Date",
            "Progress",
            "Team Members Involved",
        ),
        ("1", "Research and Analysis", "1/3/2026", "14/3/2026", "14.3%", "Israa, Duha"),
        ("2", "Requirements Gathering", "15/3/2026", "30/3/2026", "16.3%", "Israa, Duha"),
        ("3", "Design and Planning", "31/3/2026", "18/4/2026", "19.4%", "Israa, Duha"),
        ("4", "Implementation and Coding", "19/4/2026", "27/5/2026", "39.8%", "Aya"),
        ("5", "Testing and Quality Assurance", "28/5/2026", "6/6/2026", "10.2%", "Aya"),
    ]

    embed_image = USE_CASE_IMAGE.is_file()
    image_emu = image_emu_size(USE_CASE_IMAGE) if embed_image else None

    with zipfile.ZipFile(source, "r") as zin:
        new_document = rebuild_chapter1(
            zin.read("word/document.xml"),
            table_rows,
            embed_use_case_image=embed_image,
            image_emu=image_emu,
        )
        new_rels = None
        if embed_image:
            new_rels = add_image_relationship(
                zin.read("word/_rels/document.xml.rels"),
                USE_CASE_IMAGE_REL,
                USE_CASE_IMAGE_TARGET,
            )
        with zipfile.ZipFile(output, "w") as zout:
            for info in zin.infolist():
                if info.filename == "word/document.xml":
                    data = new_document
                elif info.filename == "word/_rels/document.xml.rels" and new_rels is not None:
                    data = new_rels
                else:
                    data = zin.read(info.filename)
                zout.writestr(info, data)
            if embed_image:
                zout.writestr("word/media/vibook-use-case-diagram.png", USE_CASE_IMAGE.read_bytes())


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
