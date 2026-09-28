"""Retailligence colours: one dark palette for the notebook charts, the Streamlit app and the report."""
import matplotlib.pyplot as plt

BG, PANEL, GRID = "#0b1324", "#111c33", "#243352"
TEXT, MUTED = "#e6edf7", "#94a3b8"
TEAL, SKY, AMBER, CORAL, VIOLET = "#2dd4bf", "#38bdf8", "#fbbf24", "#f87171", "#a78bfa"
BASELINES = ["#475569", "#64748b", "#94a3b8"]  # naive, seasonal naive, seasonal rule
MODELS = [SKY, TEAL]  # linear, polynomial


def apply():
    """Dark matplotlib style that matches the app and the report."""
    plt.rcParams.update({
        "figure.facecolor": BG, "axes.facecolor": BG, "savefig.facecolor": BG,
        "axes.edgecolor": GRID, "axes.labelcolor": TEXT, "axes.titlecolor": TEXT, "text.color": TEXT,
        "xtick.color": MUTED, "ytick.color": MUTED, "axes.grid": True, "axes.axisbelow": True, "grid.color": GRID, "grid.linewidth": 0.6,
        "axes.prop_cycle": plt.cycler(color=[SKY, TEAL, AMBER, CORAL, VIOLET]),
        "legend.frameon": False, "font.size": 10, "axes.titlesize": 11, "axes.titleweight": "bold",
        "figure.dpi": 100,
    })
