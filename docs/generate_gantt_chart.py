#!/usr/bin/env python3
"""Generate Vibook Table 1 project Gantt chart (Mar – Jun 2026)."""

from __future__ import annotations

from datetime import date
from pathlib import Path

# Table 1 — Chapter 1 project timeline (aligned with documentation/fill_introduction.py)
TABLE_1: list[tuple[str, str, date, date, str]] = [
    ("1", "Research and Analysis", date(2026, 3, 1), date(2026, 3, 14), "14.3%"),
    ("2", "Requirements Gathering", date(2026, 3, 15), date(2026, 3, 30), "16.3%"),
    ("3", "Design and Planning", date(2026, 3, 31), date(2026, 4, 18), "19.4%"),
    ("4", "Implementation and Coding", date(2026, 4, 19), date(2026, 5, 27), "39.8%"),
    ("5", "Testing and Quality Assurance", date(2026, 5, 28), date(2026, 6, 6), "10.2%"),
]

CHART_START = date(2026, 3, 1)
CHART_END = date(2026, 6, 30)

BAR_COLORS = ["#2D6A4F", "#40916C", "#52B788", "#74C69D", "#95D5B2"]
PROGRESS_OVERLAY = "#1B4332"


def x_pos(d: date, chart_x: float, chart_w: float) -> float:
    total = (CHART_END - CHART_START).days
    offset = max(0, min(total, (d - CHART_START).days))
    return chart_x + (offset / total) * chart_w


def parse_weight_pct(progress: str) -> float:
    """Parse WBS weight from a value such as '14.3%'."""
    return float(progress.replace("%", "").strip() or "0")


def escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def wrap_label(text: str, max_len: int = 46) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for w in words:
        candidate = f"{current} {w}".strip()
        if len(candidate) <= max_len:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = w
    if current:
        lines.append(current)
    return lines[:2]


def build_svg() -> str:
    width = 1280
    height = 460
    margin_left = 430
    margin_right = 40
    margin_top = 88
    margin_bottom = 56
    chart_x = margin_left
    chart_y = margin_top
    chart_w = width - margin_left - margin_right
    chart_h = height - margin_top - margin_bottom
    row_h = chart_h / len(TABLE_1)

    parts: list[str] = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        "<defs>",
        '<style type="text/css"><![CDATA[',
        "  .title { font: 700 22px 'Helvetica Neue', Arial, sans-serif; fill: #1B1B1B; }",
        "  .subtitle { font: 400 13px 'Helvetica Neue', Arial, sans-serif; fill: #555; }",
        "  .axis { font: 500 12px 'Helvetica Neue', Arial, sans-serif; fill: #444; }",
        "  .task-id { font: 700 12px 'Helvetica Neue', Arial, sans-serif; fill: #2D6A4F; }",
        "  .task-label { font: 400 11.5px 'Helvetica Neue', Arial, sans-serif; fill: #222; }",
        "  .grid { stroke: #E4DDD2; stroke-width: 1; }",
        "  .frame { fill: none; stroke: #CFC7BC; stroke-width: 1; }",
        "  .legend { font: 400 11px 'Helvetica Neue', Arial, sans-serif; fill: #555; }",
        "]]></style>",
        "</defs>",
        '<rect width="100%" height="100%" fill="#FCFBF8"/>',
        '<text x="40" y="42" class="title">Figure 1.2 — Vibook Project Gantt Chart</text>',
        '<text x="40" y="64" class="subtitle">Table 1 schedule · March – June 2026</text>',
        f'<rect x="{chart_x}" y="{chart_y}" width="{chart_w}" height="{chart_h}" class="frame"/>',
    ]

    month_cursor = CHART_START.replace(day=1)
    while month_cursor <= CHART_END:
        x = x_pos(month_cursor, chart_x, chart_w)
        parts.append(f'<line x1="{x:.1f}" y1="{chart_y}" x2="{x:.1f}" y2="{chart_y + chart_h}" class="grid"/>')
        parts.append(
            f'<text x="{x:.1f}" y="{chart_y + chart_h + 22}" text-anchor="middle" class="axis">'
            f'{escape(month_cursor.strftime("%b %Y"))}</text>'
        )
        if month_cursor.month == 12:
            month_cursor = date(month_cursor.year + 1, 1, 1)
        else:
            month_cursor = date(month_cursor.year, month_cursor.month + 1, 1)

    for i, (wbs, desc, start_d, end_d, progress) in enumerate(TABLE_1):
        y = chart_y + i * row_h + row_h * 0.18
        bar_h = row_h * 0.52
        x0 = x_pos(start_d, chart_x, chart_w)
        x1 = x_pos(end_d, chart_x, chart_w)
        bar_w = max(x1 - x0, 4)
        color = BAR_COLORS[i % len(BAR_COLORS)]

        label_y = y + bar_h * 0.35
        parts.append(f'<text x="36" y="{label_y:.1f}" class="task-id">Task {wbs}</text>')
        for li, line in enumerate(wrap_label(desc)):
            parts.append(
                f'<text x="78" y="{label_y + li * 14:.1f}" class="task-label">{escape(line)}</text>'
            )

        parts.append(
            f'<rect x="{x0:.1f}" y="{y:.1f}" width="{bar_w:.1f}" height="{bar_h:.1f}" rx="4" fill="{color}" />'
        )
        pct = parse_weight_pct(progress)
        if 0 < pct < 100:
            parts.append(
                f'<rect x="{x0:.1f}" y="{y:.1f}" width="{bar_w * (pct / 100):.1f}" height="{bar_h:.1f}" '
                f'rx="4" fill="{PROGRESS_OVERLAY}" opacity="0.35" />'
            )
        parts.append(
            f'<text x="{x0 + bar_w + 6:.1f}" y="{y + bar_h * 0.72:.1f}" class="axis">{escape(progress)}</text>'
        )
        if i < len(TABLE_1) - 1:
            sep_y = chart_y + (i + 1) * row_h
            parts.append(
                f'<line x1="{chart_x}" y1="{sep_y:.1f}" x2="{chart_x + chart_w}" y2="{sep_y:.1f}" class="grid" opacity="0.55"/>'
            )

    parts.append(
        f'<text x="{chart_x}" y="{height - 18}" class="legend">'
        f"Source: Table 1 (WBS 1–5). Bars use exact start and finish dates; labels show WBS weights."
        f"</text>"
    )
    parts.append("</svg>")
    return "\n".join(parts)


def write_png(png_path: Path) -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.dates as mdates
    import matplotlib.pyplot as plt
    from matplotlib.patches import FancyBboxPatch

    fig, ax = plt.subplots(figsize=(14, 5.8), facecolor="#FCFBF8")
    ax.set_facecolor("#FCFBF8")
    y_positions = list(range(len(TABLE_1) - 1, -1, -1))

    for i, (wbs, desc, start, end, prog) in enumerate(TABLE_1):
        y = y_positions[i]
        start_num = mdates.date2num(start)
        end_num = mdates.date2num(end) + 0.6
        width = max(end_num - start_num, 0.8)
        ax.add_patch(
            FancyBboxPatch(
                (start_num, y - 0.28),
                width,
                0.56,
                boxstyle="round,pad=0.02,rounding_size=0.08",
                linewidth=0,
                facecolor=BAR_COLORS[i % len(BAR_COLORS)],
            )
        )
        short = desc if len(desc) <= 52 else desc[:49] + "…"
        ax.text(
            -0.02,
            y,
            f"Task {wbs}: {short}",
            transform=ax.get_yaxis_transform(),
            va="center",
            ha="right",
            fontsize=9.5,
        )
        ax.text(end_num + 0.8, y, prog, va="center", ha="left", fontsize=9, color="#444")

    ax.set_xlim(mdates.date2num(CHART_START), mdates.date2num(CHART_END) + 2)
    ax.set_ylim(-0.8, len(TABLE_1) - 0.2)
    ax.xaxis_date()
    ax.xaxis.set_major_locator(mdates.MonthLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %Y"))
    ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)
    ax.grid(axis="x", color="#E4DDD2", linewidth=1)
    ax.set_title(
        "Figure 1.2 — Vibook Project Gantt Chart\nTable 1 schedule · March – June 2026",
        fontsize=14,
        fontweight="bold",
        loc="left",
    )
    fig.text(
        0.01,
        0.02,
        "Source: Table 1 WBS 1–5. Bars use exact start and finish dates; labels show WBS weights.",
        fontsize=9,
        color="#666",
    )
    fig.subplots_adjust(left=0.34, right=0.96, top=0.88, bottom=0.12)
    fig.savefig(png_path, dpi=180, facecolor=fig.get_facecolor())
    plt.close(fig)


def main() -> None:
    out_dir = Path(__file__).resolve().parent
    svg_path = out_dir / "vibook-project-gantt-chart.svg"
    png_path = out_dir / "vibook-project-gantt-chart.png"
    svg_path.write_text(build_svg(), encoding="utf-8")
    print(f"Wrote {svg_path}")
    try:
        write_png(png_path)
        print(f"Wrote {png_path}")
    except ImportError:
        print("matplotlib not installed — PNG skipped (SVG is available)")


if __name__ == "__main__":
    main()
