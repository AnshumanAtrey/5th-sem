"""CICIoT2023 flows: loading a fair sample, attack categories, and the preprocessing every model shares.

Shared by the notebook and the app, so a flow is cleaned the same way in training and in the live app.
"""
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, StandardScaler

LABEL = "label"
BENIGN = "BenignTraffic"
# IAT is left out on purpose: it works like the capture clock, so on its own it names the attack (notebook section 5)
LEAKY = ["IAT"]
COLUMNS = ["flow_duration", "Header_Length", "Protocol Type", "Duration", "Rate", "Srate", "Drate",
           "fin_flag_number", "syn_flag_number", "rst_flag_number", "psh_flag_number", "ack_flag_number",
           "ece_flag_number", "cwr_flag_number", "ack_count", "syn_count", "fin_count", "urg_count", "rst_count",
           "HTTP", "HTTPS", "DNS", "Telnet", "SMTP", "SSH", "IRC", "TCP", "UDP", "DHCP", "ARP", "ICMP", "IPv", "LLC",
           "Tot sum", "Min", "Max", "AVG", "Std", "Tot size", "IAT", "Number", "Magnitue", "Radius", "Covariance",
           "Variance", "Weight"]
FEATURES = [c for c in COLUMNS if c not in LEAKY]

# the 33 attacks grouped into the 7 families of the CICIoT2023 paper (Neto et al., Sensors 2023)
WEB = {"SqlInjection", "CommandInjection", "XSS", "BrowserHijacking", "Uploading_Attack", "Backdoor_Malware"}
SPOOFING = {"MITM-ArpSpoofing", "DNS_Spoofing"}
CATEGORIES = ["Benign", "DDoS", "DoS", "Mirai", "Recon", "Spoofing", "Web", "BruteForce"]


def category(label):
    """The attack family of one CICIoT2023 label, e.g. 'DDoS-SYN_Flood' -> 'DDoS'."""
    if label == BENIGN:
        return "Benign"
    if label in WEB:
        return "Web"
    if label in SPOOFING:
        return "Spoofing"
    if label == "DictionaryBruteForce":
        return "BruteForce"
    if label == "VulnerabilityScan" or label.startswith("Recon-"):
        return "Recon"
    for family in ("DDoS", "DoS", "Mirai"):
        if label.startswith(family + "-"):
            return family
    raise ValueError(f"unknown CICIoT2023 label: {label}")


def sample_flows(paths, attack_cap, benign_cap, seed=42):
    """A fair sample of the whole dataset: up to attack_cap flows of every attack type and benign_cap benign flows.

    Pass 1 counts every label across all the CSV parts, pass 2 keeps each row with probability cap / count, so rare
    attacks (a few thousand rows in 46 million) are kept whole and the huge floods are thinned out evenly.
    """
    counts = pd.concat([pd.read_csv(p, usecols=[LABEL])[LABEL].value_counts() for p in paths]).groupby(level=0).sum()
    caps = pd.Series(attack_cap, index=counts.index).where(counts.index != BENIGN, benign_cap)
    keep = (caps / counts).clip(upper=1.0)
    rng = np.random.default_rng(seed)
    parts = []
    for p in paths:
        part = pd.read_csv(p)
        parts.append(part[rng.random(len(part)) < part[LABEL].map(keep).to_numpy()])
    return pd.concat(parts, ignore_index=True), counts.sort_values(ascending=False)


def clean(X):
    """Infinite or negative values (none in the data, but a typed-in flow could have them) become missing."""
    X = pd.DataFrame(X, columns=FEATURES).apply(pd.to_numeric, errors="coerce").astype(float)
    return X.mask(~np.isfinite(X) | (X < 0))


def preprocess():
    """clean -> fill gaps with the training median -> log(1 + x) to tame the huge counts -> standardise."""
    return [("clean", FunctionTransformer(clean, feature_names_out="one-to-one")),
            ("fill", SimpleImputer(strategy="median")),
            ("log", FunctionTransformer(np.log1p, feature_names_out="one-to-one")),
            ("scale", StandardScaler())]


def pipeline(model):
    """Every model gets the same preprocessing, fitted on the training flows only."""
    return Pipeline(preprocess() + [("model", model)])
