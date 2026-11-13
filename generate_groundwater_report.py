from io import BytesIO
from datetime import datetime
import math

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, HRFlowable, PageBreak
)

# GroundPulse palette
DARK = colors.HexColor("#092B2A")
EMERALD = colors.HexColor("#167D70")
MINT = colors.HexColor("#65CFC0")
PALE = colors.HexColor("#E5F3F0")
TEXT = colors.HexColor("#263C3A")
MUTED = colors.HexColor("#657A77")
BORDER = colors.HexColor("#D8E5E2")


def _chart_buffer(fig):
    output = BytesIO()
    fig.savefig(output, format="png", dpi=190, bbox_inches="tight",
                facecolor="white")
    plt.close(fig)
    output.seek(0)
    return output


def _style_axis(ax, title, ylabel):
    ax.set_facecolor("#F7FBFA")
    ax.set_title(title, loc="left", fontsize=12, fontweight="bold",
                 color="#092B2A", pad=13)
    ax.set_ylabel(ylabel, fontsize=9, color="#657A77")
    ax.tick_params(labelsize=8, colors="#657A77")
    ax.grid(axis="y", linestyle="--", alpha=0.25)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#D8E5E2")
    ax.spines["bottom"].set_color("#D8E5E2")


def _forecast_charts(values):
    days = [f"Day {i + 1}" for i in range(len(values))]

    fig, ax = plt.subplots(figsize=(9, 3.2))
    _style_axis(ax, "Seven-day groundwater forecast", "Predicted level (m)")
    ax.plot(days, values, color="#167D70", linewidth=2.7, marker="o",
            markersize=7, markerfacecolor="#65CFC0")
    for i, value in enumerate(values):
        ax.annotate(f"{value:.2f}", (i, value), xytext=(0, 9),
                    textcoords="offset points", ha="center", fontsize=8,
                    color="#092B2A")
    ax.set_xlabel("Forecast period", fontsize=9)
    ax.margins(x=0.08, y=0.22)
    fig.tight_layout()
    line = _chart_buffer(fig)

    fig, ax = plt.subplots(figsize=(9, 3.0))
    _style_axis(ax, "Daily predicted level comparison", "Predicted level (m)")
    bars = ax.bar(days, values, color="#65CFC0", edgecolor="#167D70",
                  linewidth=0.8, width=0.62)
    for bar, value in zip(bars, values):
        ax.annotate(f"{value:.2f}",
                    (bar.get_x() + bar.get_width() / 2, value),
                    xytext=(0, 5), textcoords="offset points",
                    ha="center", fontsize=8, color="#092B2A")
    ax.set_xlabel("Forecast period", fontsize=9)
    ax.margins(y=0.22)
    fig.tight_layout()
    bar = _chart_buffer(fig)

    changes = [values[i] - values[i - 1] for i in range(1, len(values))]
    labels = [f"{i} → {i + 1}" for i in range(1, len(values))]
    fig, ax = plt.subplots(figsize=(9, 2.7))
    _style_axis(ax, "Day-to-day forecast variation", "Change (m)")
    bar_colors = ["#167D70" if v >= 0 else "#D28A55" for v in changes]
    bars = ax.bar(labels, changes, color=bar_colors, width=0.58)
    ax.axhline(0, color="#657A77", linewidth=0.8)
    for rect, value in zip(bars, changes):
        ax.annotate(f"{value:+.3f}",
                    (rect.get_x() + rect.get_width() / 2, value),
                    xytext=(0, 4 if value >= 0 else -12),
                    textcoords="offset points", ha="center", fontsize=8)
    ax.set_xlabel("Consecutive forecast days", fontsize=9)
    ax.margins(y=0.35)
    fig.tight_layout()
    variation = _chart_buffer(fig)
    return line, bar, variation


def _historical_chart(records):
    usable = []
    for record in records or []:
        if not isinstance(record, dict):
            continue
        try:
            date = datetime.fromisoformat(str(record.get("date"))[:10])
            value = float(record.get("groundwater"))
            if math.isfinite(value):
                usable.append((date, value))
        except (ValueError, TypeError):
            continue

    if not usable:
        return None, []

    usable.sort(key=lambda item: item[0])
    usable = usable[-24:]  # recent observations, for readability
    dates = [item[0] for item in usable]
    values = [item[1] for item in usable]

    fig, ax = plt.subplots(figsize=(9, 3.2))
    _style_axis(ax, "Historical groundwater observations", "Observed level (m)")
    ax.plot(dates, values, color="#167D70", linewidth=2.2, marker="o",
            markersize=4, markerfacecolor="#65CFC0")
    ax.set_xlabel("Observation date", fontsize=9)
    fig.autofmt_xdate(rotation=25)
    ax.margins(x=0.03, y=0.18)
    fig.tight_layout()
    return _chart_buffer(fig), values


def _page_chrome(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(DARK)
    canvas.rect(0, height - 7 * mm, width, 7 * mm, fill=1, stroke=0)
    canvas.setStrokeColor(MINT)
    canvas.setLineWidth(0.8)
    canvas.line(18 * mm, 15 * mm, width - 18 * mm, 15 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 9 * mm,
                      "GroundPulse  |  Predict. Understand. Protect.")
    canvas.drawRightString(width - 18 * mm, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


def generate_groundwater_report(
    forecast,
    historical_data=None,
    prediction_type="7-Day Forecast",
    status=None
):
    """Create a branded GroundPulse PDF and return it as a BytesIO buffer.

    historical_data, when supplied, should be a list of dictionaries with
    'date' and 'groundwater' keys.
    """
    if not isinstance(forecast, (list, tuple)) or not forecast:
        raise ValueError("No prediction values provided.")

    try:
        forecast = [float(value) for value in forecast]
    except (ValueError, TypeError):
        raise ValueError("Forecast contains invalid values.")

    if not all(math.isfinite(value) for value in forecast):
        raise ValueError("Forecast values must be finite numbers.")

    n = len(forecast)
    average = sum(forecast) / n
    highest, lowest = max(forecast), min(forecast)
    spread = highest - lowest
    generated = datetime.now().strftime("%d %B %Y, %I:%M %p")

    doc = SimpleDocTemplate(
        buffer := BytesIO(), pagesize=A4,
        rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=16 * mm, bottomMargin=22 * mm,
        title="GroundPulse Groundwater Intelligence Report",
        author="GroundPulse"
    )

    base = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "HeroTitle", parent=base["Title"], fontName="Helvetica-Bold",
        fontSize=25, leading=29, textColor=colors.white, alignment=0
    )
    section = ParagraphStyle(
        "Section", parent=base["Heading2"], fontName="Helvetica-Bold",
        fontSize=13, leading=17, textColor=EMERALD,
        spaceBefore=8, spaceAfter=7
    )
    body = ParagraphStyle(
        "BodySmall", parent=base["BodyText"], fontSize=8.5,
        leading=12, textColor=TEXT
    )
    muted = ParagraphStyle(
        "MutedSmall", parent=base["BodyText"], fontSize=7.5,
        leading=10.5, textColor=MUTED
    )
    kpi_label = ParagraphStyle(
        "KpiLabel", parent=base["Normal"], fontSize=7,
        leading=9, textColor=MUTED
    )
    kpi_value = ParagraphStyle(
        "KpiValue", parent=base["Normal"], fontName="Helvetica-Bold",
        fontSize=15, leading=18, textColor=DARK
    )

    story = []

    # PAGE 1: Executive overview
    hero_right = Paragraph(
        "<b>FORECAST REPORT</b><br/><br/>Varthur<br/>Bengaluru, Karnataka",
        ParagraphStyle("HeroRight", parent=base["Normal"], fontSize=9,
                       leading=13, textColor=colors.white)
    )
    hero = Table([[
        Paragraph("GROUNDPULSE<br/><font size='15'>Groundwater Intelligence</font>",
                  title_style),
        hero_right
    ]], colWidths=[105 * mm, 55 * mm], rowHeights=[34 * mm])
    hero.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), DARK),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("LINEBEFORE", (1, 0), (1, 0), 1.2, MINT),
    ]))
    story += [Spacer(1, 4 * mm), hero, Spacer(1, 4 * mm)]
    story.append(Paragraph(
        "A concise view of predicted groundwater levels generated by the "
        "GroundPulse machine-learning pipeline.", body
    ))

    story.append(Paragraph("01  |  Forecast at a glance", section))

    def kpi(label, value, bg):
        content = Table(
            [[Paragraph(label, kpi_label)],
             [Paragraph(value, kpi_value)]],
            colWidths=[38 * mm]
        )
        cell = Table([[content]], colWidths=[38 * mm], rowHeights=[21 * mm])
        cell.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), bg),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ]))
        return cell

    kpis = Table([[
        kpi("AVERAGE PREDICTED LEVEL", f"{average:.2f} m", PALE),
        kpi("HIGHEST PREDICTED VALUE", f"{highest:.2f} m",
            colors.HexColor("#EAF0F8")),
        kpi("LOWEST PREDICTED VALUE", f"{lowest:.2f} m",
            colors.HexColor("#F5F0E2")),
        kpi("FORECAST SPREAD", f"{spread:.2f} m",
            colors.HexColor("#F0EBF5")),
    ]], colWidths=[41 * mm] * 4)
    kpis.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 1),
        ("RIGHTPADDING", (0, 0), (-1, -1), 1),
    ]))
    story += [kpis, Spacer(1, 3 * mm)]

    story.append(Paragraph("02  |  Report information", section))
    details = [
        ["REPORT DETAIL", "VALUE"],
        ["Study location", "Varthur, Bengaluru, Karnataka"],
        ["Report type", str(prediction_type)],
        ["Generated on", generated],
        ["Forecast duration", f"{n} days"],
        ["Prediction pipeline", "GroundPulse machine-learning pipeline"],
    ]
    table = Table(details, colWidths=[48 * mm, 116 * mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), EMERALD),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(table)

    story.append(Paragraph("03  |  Predicted groundwater levels", section))
    rows = [["FORECAST DAY", "PREDICTED LEVEL (m)"]]
    rows += [[f"Day {i + 1}", f"{value:.2f}"]
             for i, value in enumerate(forecast)]
    predictions = Table(rows, colWidths=[75 * mm, 89 * mm], repeatRows=1)
    predictions.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
        ("ALIGN", (1, 1), (1, -1), "RIGHT"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(predictions)

    # PAGE 2: Forecast visualizations
    story.append(PageBreak())
    story.append(Paragraph("Forecast analytics", section))
    story.append(Paragraph(
        "Three complementary views of the forecast: overall trend, "
        "day-wise comparison and consecutive-day variation.", body
    ))
    line_chart, bar_chart, variation_chart = _forecast_charts(forecast)
    story += [
        Spacer(1, 3 * mm),
        Image(line_chart, width=165 * mm, height=59 * mm),
        Spacer(1, 3 * mm),
        Image(bar_chart, width=165 * mm, height=55 * mm),
        Spacer(1, 3 * mm),
        Image(variation_chart, width=165 * mm, height=49 * mm),
    ]

    # PAGE 3: Historical context, when data is provided
    historical_image, historical_values = _historical_chart(historical_data)
    if historical_image is not None or status:
        story.append(PageBreak())
        story.append(Paragraph("Historical context & notes", section))

        if historical_image is not None:
            hist_rows = [
                ["HISTORICAL METRIC", "VALUE"],
                ["Average observed level",
                 f"{sum(historical_values) / len(historical_values):.2f} m"],
                ["Highest observed value", f"{max(historical_values):.2f} m"],
                ["Lowest observed value", f"{min(historical_values):.2f} m"],
                ["Observations displayed", str(len(historical_values))],
            ]
            hist_table = Table(hist_rows, colWidths=[82 * mm, 82 * mm])
            hist_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), EMERALD),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
                ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]))
            story += [hist_table, Spacer(1, 5 * mm),
                      Image(historical_image, width=165 * mm, height=60 * mm)]
        else:
            story.append(Paragraph(
                "Historical visualization was not generated because usable "
                "records containing both date and groundwater values were not supplied.",
                body
            ))

        if status:
            story.append(Paragraph("Prediction status", section))
            story.append(Paragraph(str(status), body))

    # Disclaimer
    story += [
        Spacer(1, 5 * mm),
        HRFlowable(width="100%", thickness=1, color=MINT,
                   spaceBefore=3, spaceAfter=8),
        Paragraph(
            "<b>Important note:</b> Groundwater values in this report are "
            "machine-learning estimates based on the input data and model "
            "used by GroundPulse. They are not direct groundwater measurements "
            "or guaranteed future values. The report is for informational "
            "purposes only. The meaning of increases or decreases depends on "
            "the measurement convention used by the source dataset.",
            muted
        ),
        Spacer(1, 4 * mm),
        Paragraph(
            "<b>GroundPulse</b>  |  Predict. Understand. Protect.",
            ParagraphStyle("Closing", parent=base["Normal"], fontSize=9,
                           textColor=EMERALD, alignment=1)
        )
    ]

    doc.build(story, onFirstPage=_page_chrome, onLaterPages=_page_chrome)
    buffer.seek(0)
    return buffer
