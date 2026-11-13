
import io
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, PageBreak, KeepTogether, HRFlowable
)


# ==================================================
# GROUNDPULSE REPORT THEME
# ==================================================

DARK = colors.HexColor("#092B2A")
EMERALD = colors.HexColor("#167D70")
MINT = colors.HexColor("#65CFC0")
PALE = colors.HexColor("#E5F3F0")
TEXT = colors.HexColor("#263C3A")
MUTED = colors.HexColor("#657A77")
BORDER = colors.HexColor("#D8E5E2")
WHITE = colors.white

PAGE_WIDTH, PAGE_HEIGHT = A4


# ==================================================
# DATA PREPARATION
# ==================================================

def prepare_dataframe(records):

    required = [
        "date",
        "groundwater",
        "rainfall",
        "temperature",
        "soil",
        "radiation"
    ]

    df = pd.DataFrame(records)

    missing = [
        column for column in required
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            f"Missing required columns: {missing}"
        )

    df = df[required].copy()

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    numeric_columns = [
        "groundwater",
        "rainfall",
        "temperature",
        "soil",
        "radiation"
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    df = df.replace(
        [np.inf, -np.inf],
        np.nan
    )

    df = df.dropna(
        subset=["date"]
    )

    df = df.sort_values(
        "date"
    ).reset_index(drop=True)

    if df.empty:
        raise ValueError(
            "No valid dated records were supplied."
        )

    return df


# ==================================================
# CHART HELPERS
# ==================================================

def figure_to_buffer(fig):

    buffer = io.BytesIO()

    fig.savefig(
        buffer,
        format="png",
        dpi=180,
        bbox_inches="tight",
        facecolor="white"
    )

    plt.close(fig)

    buffer.seek(0)

    return buffer


def style_axis(ax):

    ax.grid(
        True,
        alpha=0.22,
        linestyle="--"
    )

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    ax.tick_params(
        axis="both",
        labelsize=8
    )


def add_padded_y_limits(ax, values, fraction=0.10):

    values = pd.Series(values).dropna()

    if values.empty:
        return

    low = float(values.min())
    high = float(values.max())

    spread = high - low

    if spread == 0:
        padding = max(abs(low) * fraction, 0.1)
    else:
        padding = spread * fraction

    ax.set_ylim(
        low - padding,
        high + padding
    )


# ==================================================
# 1. GROUNDWATER TREND CHART
# ==================================================

def create_groundwater_chart(df):

    data = df.dropna(
        subset=["date", "groundwater"]
    )

    fig, ax = plt.subplots(
        figsize=(8.2, 3.2)
    )

    ax.plot(
        data["date"],
        data["groundwater"],
        linewidth=1.9,
        color="#167D70"
    )

    if not data.empty:

        lower = data["groundwater"].min()

        ax.fill_between(
            data["date"],
            data["groundwater"],
            lower,
            alpha=0.10,
            color="#65CFC0"
        )

        add_padded_y_limits(
            ax,
            data["groundwater"],
            0.12
        )

    ax.set_title(
        "Historical Groundwater Level",
        fontsize=12,
        fontweight="bold",
        pad=10
    )

    ax.set_ylabel(
        "Groundwater Level (m)",
        fontsize=9
    )

    ax.set_xlabel(
        "Date",
        fontsize=9
    )

    style_axis(ax)

    fig.autofmt_xdate()
    fig.tight_layout()

    return figure_to_buffer(fig)


# ==================================================
# 2. ENVIRONMENTAL FEATURE VARIATION
# ==================================================

def create_feature_variation_chart(df):

    features = [
        ("rainfall", "Rainfall", "Rainfall (mm)"),
        ("temperature", "Temperature", "Temperature (°C)"),
        ("soil", "Root-Zone Soil Wetness", "Soil Wetness"),
        ("radiation", "Solar Radiation", "Solar Radiation")
    ]

    fig, axes = plt.subplots(
        2, 2,
        figsize=(9.0, 6.0)
    )

    axes = axes.flatten()

    for ax, (column, title, ylabel) in zip(
        axes,
        features
    ):

        data = df.dropna(
            subset=["date", column]
        )

        ax.plot(
            data["date"],
            data[column],
            linewidth=1.45,
            color="#167D70"
        )

        if not data.empty:

            ax.fill_between(
                data["date"],
                data[column],
                data[column].min(),
                alpha=0.09,
                color="#65CFC0"
            )

        ax.set_title(
            title,
            fontsize=10,
            fontweight="bold"
        )

        ax.set_ylabel(
            ylabel,
            fontsize=8
        )

        ax.set_xlabel(
            "Date",
            fontsize=8
        )

        style_axis(ax)

        ax.tick_params(
            axis="x",
            labelrotation=25
        )

    fig.suptitle(
        "Environmental Feature Variation Over Time",
        fontsize=13,
        fontweight="bold",
        y=1.01
    )

    fig.tight_layout()

    return figure_to_buffer(fig)


# ==================================================
# 3. SCATTER PLOTS
# ==================================================

def create_scatter_chart(
    df,
    x_column,
    title,
    xlabel
):

    data = df.dropna(
        subset=[x_column, "groundwater"]
    )

    fig, ax = plt.subplots(
        figsize=(7.2, 3.0)
    )

    ax.scatter(
        data[x_column],
        data["groundwater"],
        alpha=0.62,
        s=23,
        color="#167D70",
        edgecolors="white",
        linewidths=0.25
    )

    if (
        len(data) >= 2
        and data[x_column].nunique() > 1
    ):

        slope, intercept = np.polyfit(
            data[x_column],
            data["groundwater"],
            1
        )

        x_values = np.linspace(
            data[x_column].min(),
            data[x_column].max(),
            100
        )

        ax.plot(
            x_values,
            slope * x_values + intercept,
            color="#D97757",
            linewidth=1.8
        )

    ax.set_title(
        title,
        fontsize=11,
        fontweight="bold"
    )

    ax.set_xlabel(
        xlabel,
        fontsize=8
    )

    ax.set_ylabel(
        "Groundwater Level (m)",
        fontsize=8
    )

    style_axis(ax)

    fig.tight_layout()

    return figure_to_buffer(fig)


# ==================================================
# 4. CORRELATION HEATMAP
# ==================================================

def create_correlation_heatmap(df):

    columns = [
        "groundwater",
        "rainfall",
        "temperature",
        "soil",
        "radiation"
    ]

    labels = [
        "Groundwater",
        "Rainfall",
        "Temperature",
        "Soil moisture",
        "Solar radiation"
    ]

    correlation = df[columns].corr(
        method="pearson"
    )

    fig, ax = plt.subplots(
        figsize=(6.7, 5.1)
    )

    image = ax.imshow(
        correlation,
        cmap="RdYlBu_r",
        vmin=-1,
        vmax=1
    )

    ax.set_xticks(
        range(len(labels))
    )

    ax.set_yticks(
        range(len(labels))
    )

    ax.set_xticklabels(
        labels,
        rotation=32,
        ha="right",
        fontsize=8
    )

    ax.set_yticklabels(
        labels,
        fontsize=8
    )

    for i in range(len(labels)):
        for j in range(len(labels)):

            value = correlation.iloc[i, j]

            label = (
                f"{value:.2f}"
                if pd.notna(value)
                else "N/A"
            )

            ax.text(
                j,
                i,
                label,
                ha="center",
                va="center",
                fontsize=8,
                color="#172B2A"
            )

    ax.set_title(
        "Environmental Correlation Matrix",
        fontsize=12,
        fontweight="bold",
        pad=12
    )

    fig.colorbar(
        image,
        ax=ax,
        fraction=0.046,
        pad=0.04
    )

    fig.tight_layout()

    return figure_to_buffer(fig), correlation


# ==================================================
# 5. ROLLING RAINFALL ANALYSIS
# ==================================================

def create_rainfall_rolling_chart(df):

    data = df[
        ["date", "rainfall", "groundwater"]
    ].copy()

    windows = [3, 7, 15, 30]

    fig, ax = plt.subplots(
        figsize=(8.2, 3.3)
    )

    for window in windows:

        column = f"rolling_{window}"

        data[column] = (
            data["rainfall"]
            .rolling(
                window=window,
                min_periods=window
            )
            .sum()
        )

        ax.plot(
            data["date"],
            data[column],
            label=f"{window}-day total",
            linewidth=1.5
        )

    ax.set_title(
        "Rolling Rainfall Accumulation",
        fontsize=12,
        fontweight="bold"
    )

    ax.set_xlabel(
        "Date",
        fontsize=9
    )

    ax.set_ylabel(
        "Rainfall total (mm)",
        fontsize=9
    )

    ax.legend(
        loc="upper left",
        fontsize=8,
        ncol=2
    )

    style_axis(ax)

    fig.autofmt_xdate()
    fig.tight_layout()

    return figure_to_buffer(fig), data


# ==================================================
# REPORT STYLES
# ==================================================

def create_styles():

    styles = getSampleStyleSheet()

    styles.add(
        ParagraphStyle(
            name="CoverTitleGP",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=27,
            leading=32,
            textColor=DARK,
            alignment=TA_CENTER,
            spaceAfter=10
        )
    )

    styles.add(
        ParagraphStyle(
            name="CoverSubtitleGP",
            parent=styles["Normal"],
            fontSize=12,
            leading=18,
            textColor=MUTED,
            alignment=TA_CENTER
        )
    )

    styles.add(
        ParagraphStyle(
            name="SectionHeadingGP",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            textColor=DARK,
            spaceBefore=5,
            spaceAfter=8
        )
    )

    styles.add(
        ParagraphStyle(
            name="BodyGP",
            parent=styles["BodyText"],
            fontSize=8.8,
            leading=13,
            textColor=TEXT,
            spaceAfter=6
        )
    )

    styles.add(
        ParagraphStyle(
            name="NoteGP",
            parent=styles["BodyText"],
            fontSize=7.8,
            leading=11,
            textColor=MUTED
        )
    )

    return styles


# ==================================================
# PAGE HEADER AND FOOTER
# ==================================================

def draw_page(canvas, doc):

    canvas.saveState()

    canvas.setFillColor(DARK)

    canvas.rect(
        0,
        PAGE_HEIGHT - 13 * mm,
        PAGE_WIDTH,
        13 * mm,
        fill=1,
        stroke=0
    )

    canvas.setFillColor(WHITE)

    canvas.setFont(
        "Helvetica-Bold",
        9
    )

    canvas.drawString(
        18 * mm,
        PAGE_HEIGHT - 8.5 * mm,
        "GROUNDPULSE  |  ANALYTICS REPORT"
    )

    canvas.setStrokeColor(BORDER)

    canvas.line(
        18 * mm,
        15 * mm,
        PAGE_WIDTH - 18 * mm,
        15 * mm
    )

    canvas.setFillColor(MUTED)

    canvas.setFont(
        "Helvetica",
        7.5
    )

    canvas.drawString(
        18 * mm,
        10 * mm,
        "Machine Learning-Based Groundwater Analysis"
    )

    canvas.drawRightString(
        PAGE_WIDTH - 18 * mm,
        10 * mm,
        f"Page {doc.page}"
    )

    canvas.restoreState()


# ==================================================
# TABLE HELPER
# ==================================================

def make_table(
    data,
    widths=None,
    font_size=8
):

    table = Table(
        data,
        colWidths=widths,
        repeatRows=1
    )

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), font_size),
            ("TEXTCOLOR", (0, 1), (-1, -1), TEXT),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [PALE, WHITE]),
            ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6)
        ])
    )

    return table


def image_flowable(buffer, width, height):

    buffer.seek(0)

    return Image(
        buffer,
        width=width,
        height=height
    )


# ==================================================
# MAIN PDF GENERATOR
# ==================================================

def generate_analytics(records):

    df = prepare_dataframe(records)

    styles = create_styles()

    output = io.BytesIO()

    doc = SimpleDocTemplate(
        output,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=21 * mm,
        bottomMargin=21 * mm,
        title="GroundPulse Analytics Report",
        author="GroundPulse"
    )

    story = []

    # --------------------------------------------------
    # PAGE 1: COVER
    # --------------------------------------------------

    story.append(
        Spacer(1, 17 * mm)
    )

    story.append(
        Paragraph(
            "GROUNDPULSE",
            styles["CoverTitleGP"]
        )
    )

    story.append(
        Paragraph(
            "Historical Groundwater Analytics Report",
            styles["CoverSubtitleGP"]
        )
    )

    story.append(
        Spacer(1, 5 * mm)
    )

    story.append(
        HRFlowable(
            width="34%",
            thickness=2,
            color=EMERALD,
            hAlign="CENTER",
            spaceBefore=3,
            spaceAfter=9
        )
    )

    story.append(
        Paragraph(
            "Environmental Data Analysis and Groundwater Trend Insights",
            styles["CoverSubtitleGP"]
        )
    )

    story.append(
        Spacer(1, 13 * mm)
    )

    start_date = df["date"].min().strftime(
        "%d %B %Y"
    )

    end_date = df["date"].max().strftime(
        "%d %B %Y"
    )

    overview = [
        ["Dataset Overview", "Value"],
        ["Study Location", "Varthur, Bengaluru, Karnataka"],
        ["Total Dated Records", str(len(df))],
        [
            "Observation Period",
            f"{start_date} to {end_date}"
        ],
        [
            "Report Generated",
            pd.Timestamp.now().strftime("%d %B %Y")
        ]
    ]

    story.append(
        make_table(
            overview,
            [58 * mm, 102 * mm],
            9
        )
    )

    story.append(
        Spacer(1, 11 * mm)
    )

    story.append(
        Paragraph(
            "This report explores historical groundwater behaviour "
            "and examines its descriptive relationships with rainfall, "
            "temperature, root-zone soil wetness and solar radiation.",
            styles["BodyGP"]
        )
    )

    story.append(
        Paragraph(
            "The analysis is based on the available historical "
            "observations. It is descriptive and should not be "
            "interpreted as proof of causal relationships.",
            styles["NoteGP"]
        )
    )

    story.append(PageBreak())

    # --------------------------------------------------
    # PAGE 2: STATISTICS AND GROUNDWATER TREND
    # --------------------------------------------------

    story.append(
        Paragraph(
            "1. Descriptive Statistics",
            styles["SectionHeadingGP"]
        )
    )

    labels = {
        "groundwater": "Groundwater (m)",
        "rainfall": "Rainfall (mm)",
        "temperature": "Temperature (°C)",
        "soil": "Root-Zone Soil Wetness",
        "radiation": "Solar Radiation"
    }

    stats = [[
        "Parameter",
        "Mean",
        "Minimum",
        "Maximum",
        "Std. Dev."
    ]]

    for column, label in labels.items():

        values = df[column].dropna()

        if values.empty:
            continue

        stats.append([
            label,
            f"{values.mean():.3f}",
            f"{values.min():.3f}",
            f"{values.max():.3f}",
            (
                f"{values.std():.3f}"
                if len(values) > 1
                else "N/A"
            )
        ])

    story.append(
        make_table(
            stats,
            [
                51 * mm,
                27 * mm,
                27 * mm,
                27 * mm,
                28 * mm
            ],
            7.5
        )
    )

    story.append(
        Spacer(1, 5 * mm)
    )

    story.append(
        Paragraph(
            "The table summarizes the mean, minimum, maximum and "
            "standard deviation of each available environmental "
            "variable. Each statistic uses the valid observations "
            "for that variable.",
            styles["BodyGP"]
        )
    )

    story.append(
        Paragraph(
            "2. Historical Groundwater Trend",
            styles["SectionHeadingGP"]
        )
    )

    groundwater_chart = create_groundwater_chart(df)

    story.append(
        image_flowable(
            groundwater_chart,
            165 * mm,
            67 * mm
        )
    )

    story.append(
        Paragraph(
            "The vertical axis is focused on the observed groundwater "
            "range to make changes over time easier to inspect.",
            styles["NoteGP"]
        )
    )

    story.append(PageBreak())

    # --------------------------------------------------
    # PAGE 3: FEATURE VARIATION
    # --------------------------------------------------

    story.append(
        Paragraph(
            "3. Environmental Feature Variation",
            styles["SectionHeadingGP"]
        )
    )

    feature_chart = create_feature_variation_chart(df)

    story.append(
        image_flowable(
            feature_chart,
            165 * mm,
            112 * mm
        )
    )

    story.append(
        Spacer(1, 4 * mm)
    )

    story.append(
        Paragraph(
            "The four panels show the recorded variation in rainfall, "
            "temperature, root-zone soil wetness and solar radiation "
            "over the observation period. Gaps indicate unavailable "
            "measurements.",
            styles["BodyGP"]
        )
    )

    story.append(PageBreak())

    # --------------------------------------------------
    # PAGE 4: SCATTER PLOTS
    # --------------------------------------------------

    story.append(
        Paragraph(
            "4. Environmental Parameters vs Groundwater",
            styles["SectionHeadingGP"]
        )
    )

    scatter_items = [
        (
            "rainfall",
            "Rainfall vs Groundwater",
            "Rainfall (mm)"
        ),
        (
            "temperature",
            "Temperature vs Groundwater",
            "Temperature (°C)"
        ),
        (
            "soil",
            "Soil Wetness vs Groundwater",
            "Root-Zone Soil Wetness"
        )
    ]

    for column, title, xlabel in scatter_items:

        chart = create_scatter_chart(
            df,
            column,
            title,
            xlabel
        )

        story.append(
            image_flowable(
                chart,
                150 * mm,
                59 * mm
            )
        )

        story.append(
            Spacer(1, 2 * mm)
        )

    story.append(
        Paragraph(
            "The scatter plots show the distribution of paired "
            "observations. The fitted line summarizes the direction "
            "of a simple linear trend and does not establish causation.",
            styles["NoteGP"]
        )
    )

    story.append(PageBreak())

    # --------------------------------------------------
    # PAGE 5: CORRELATION ANALYSIS
    # --------------------------------------------------

    story.append(
        Paragraph(
            "5. Environmental Correlation Analysis",
            styles["SectionHeadingGP"]
        )
    )

    heatmap, correlation = create_correlation_heatmap(df)

    story.append(
        image_flowable(
            heatmap,
            137 * mm,
            105 * mm
        )
    )

    story.append(
        Spacer(1, 3 * mm)
    )

    corr_table = [[
        "Variable",
        "Groundwater",
        "Rainfall",
        "Temperature",
        "Soil",
        "Radiation"
    ]]

    short_labels = [
        "Groundwater",
        "Rainfall",
        "Temperature",
        "Soil",
        "Radiation"
    ]

    for row_index, label in enumerate(short_labels):

        row = [label]

        for column in [
            "groundwater",
            "rainfall",
            "temperature",
            "soil",
            "radiation"
        ]:

            value = correlation.iloc[row_index][column]

            row.append(
                f"{value:.2f}"
                if pd.notna(value)
                else "N/A"
            )

        corr_table.append(row)

    story.append(
        make_table(
            corr_table,
            [
                35 * mm,
                25 * mm,
                23 * mm,
                27 * mm,
                20 * mm,
                25 * mm
            ],
            6.5
        )
    )

    story.append(
        Spacer(1, 5 * mm)
    )

    story.append(
        Paragraph(
            "Pearson correlation ranges from -1 to +1. Positive "
            "values indicate positive linear association, negative "
            "values indicate negative linear association, and values "
            "near zero indicate weak linear association. Correlation "
            "does not prove causation.",
            styles["BodyGP"]
        )
    )

    story.append(PageBreak())

    # --------------------------------------------------
    # PAGE 6: ROLLING RAINFALL
    # --------------------------------------------------

    story.append(
        Paragraph(
            "6. Rolling Rainfall Analysis",
            styles["SectionHeadingGP"]
        )
    )

    rolling_chart, rolling_data = (
        create_rainfall_rolling_chart(df)
    )

    story.append(
        image_flowable(
            rolling_chart,
            165 * mm,
            69 * mm
        )
    )

    story.append(
        Spacer(1, 5 * mm)
    )

    rolling_stats = [[
        "Rainfall Window",
        "Mean Accumulation (mm)",
        "Maximum (mm)"
    ]]

    for window in [3, 7, 15, 30]:

        values = rolling_data[
            f"rolling_{window}"
        ].dropna()

        if values.empty:

            rolling_stats.append([
                f"{window} days",
                "N/A",
                "N/A"
            ])

        else:

            rolling_stats.append([
                f"{window} days",
                f"{values.mean():.3f}",
                f"{values.max():.3f}"
            ])

    story.append(
        make_table(
            rolling_stats,
            [
                52 * mm,
                55 * mm,
                55 * mm
            ],
            8
        )
    )

    story.append(
        Spacer(1, 6 * mm)
    )

    story.append(
        Paragraph(
            "Rolling rainfall is calculated as the sum of daily "
            "rainfall within consecutive 3-, 7-, 15- and 30-observation "
            "windows. The calculation assumes the records are in daily "
            "sequence; missing calendar dates are not automatically filled.",
            styles["BodyGP"]
        )
    )

    story.append(
        Paragraph(
            "Review unusually large rainfall totals against the source "
            "data and confirm the rainfall unit before interpreting them.",
            styles["NoteGP"]
        )
    )

    story.append(PageBreak())

    # --------------------------------------------------
    # PAGE 7: METHODOLOGY AND INTERPRETATION
    # --------------------------------------------------

    story.append(
        Paragraph(
            "7. Interpretation and Methodological Notes",
            styles["SectionHeadingGP"]
        )
    )

    notes = [
        (
            "Groundwater representation:",
            "The dataset contains negative groundwater depth values. "
            "Under this convention, a more negative value represents "
            "greater depth, while a value closer to zero represents "
            "a shallower water level."
        ),
        (
            "Environmental relationships:",
            "Rainfall, temperature, root-zone soil wetness and solar "
            "radiation are compared with groundwater observations. "
            "Relationships may vary with seasonality, time lags and "
            "other factors."
        ),
        (
            "Correlation:",
            "Pearson correlation measures linear association. It does "
            "not demonstrate that one environmental parameter caused "
            "a groundwater change."
        ),
        (
            "Rolling rainfall:",
            "Rolling totals use consecutive observations. If dates are "
            "missing, a window represents consecutive available rows, "
            "not necessarily a complete uninterrupted calendar period."
        ),
        (
            "Missing values:",
            "Missing or non-numeric values are excluded from the relevant "
            "statistics and charts. They are not replaced with zero."
        ),
        (
            "Interpretation:",
            "This report is a descriptive analysis of the supplied "
            "historical dataset. It is not a real-time monitoring feed "
            "or a standalone forecast."
        )
    ]

    for heading, description in notes:

        story.append(
            KeepTogether([
                Paragraph(
                    f"<b>{heading}</b> {description}",
                    styles["BodyGP"]
                ),
                Spacer(1, 3 * mm)
            ])
        )

    story.append(
        Spacer(1, 10 * mm)
    )

    story.append(
        HRFlowable(
            width="100%",
            thickness=0.8,
            color=BORDER,
            spaceBefore=4,
            spaceAfter=10
        )
    )

    story.append(
        Paragraph(
            "End of GroundPulse Analytics Report",
            ParagraphStyle(
                name="EndNoteGP",
                parent=styles["BodyGP"],
                alignment=TA_CENTER,
                textColor=EMERALD,
                fontName="Helvetica-Bold",
                fontSize=11
            )
        )
    )

    # --------------------------------------------------
    # BUILD PDF
    # --------------------------------------------------

    doc.build(
        story,
        onFirstPage=draw_page,
        onLaterPages=draw_page
    )

    output.seek(0)

    return output
