"""The shared data code: attack families, the fair sample, and the cleaning every model and the app use."""
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from flows import BENIGN, CATEGORIES, COLUMNS, FEATURES, LEAKY, category, clean, sample_flows  # noqa: E402

LABELS = ["BenignTraffic", "DDoS-ICMP_Flood", "DDoS-UDP_Flood", "DDoS-TCP_Flood", "DDoS-PSHACK_Flood",
          "DDoS-SYN_Flood", "DDoS-RSTFINFlood", "DDoS-SynonymousIP_Flood", "DDoS-ICMP_Fragmentation",
          "DDoS-ACK_Fragmentation", "DDoS-UDP_Fragmentation", "DDoS-HTTP_Flood", "DDoS-SlowLoris", "DoS-UDP_Flood",
          "DoS-TCP_Flood", "DoS-SYN_Flood", "DoS-HTTP_Flood", "Mirai-greeth_flood", "Mirai-udpplain",
          "Mirai-greip_flood", "MITM-ArpSpoofing", "DNS_Spoofing", "Recon-HostDiscovery", "Recon-OSScan",
          "Recon-PortScan", "Recon-PingSweep", "VulnerabilityScan", "DictionaryBruteForce", "SqlInjection",
          "BrowserHijacking", "CommandInjection", "Backdoor_Malware", "XSS", "Uploading_Attack"]


def test_all_34_labels_map_to_the_7_families_plus_benign():
    families = {label: category(label) for label in LABELS}
    assert set(families.values()) == set(CATEGORIES)
    assert families["DDoS-SYN_Flood"] == "DDoS" and families["DoS-SYN_Flood"] == "DoS"
    assert families["VulnerabilityScan"] == "Recon" and families["XSS"] == "Web"
    with pytest.raises(ValueError):
        category("SomethingNew")


def test_the_leaky_clock_column_is_never_a_feature():
    assert LEAKY == ["IAT"] and "IAT" not in FEATURES
    assert len(FEATURES) == len(COLUMNS) - 1 == 45


def test_clean_turns_bad_values_into_gaps_and_keeps_good_ones():
    row = pd.DataFrame([dict.fromkeys(FEATURES, 1.0)])
    row = row.astype(object)
    row.loc[0, FEATURES[0]] = -1
    row.loc[0, FEATURES[1]] = np.inf
    row.loc[0, FEATURES[2]] = "text"
    out = clean(row)
    assert out.iloc[0, :3].isna().all() and (out.iloc[0, 3:] == 1.0).all()
    assert list(out.columns) == FEATURES


def test_sample_keeps_rare_attacks_whole_and_thins_big_ones(tmp_path):
    rng = np.random.default_rng(0)
    for i in range(3):
        labels = [BENIGN] * 2000 + ["DDoS-ICMP_Flood"] * 3000 + ["XSS"] * 5
        part = pd.DataFrame(rng.random((len(labels), len(COLUMNS))), columns=COLUMNS).assign(label=labels)
        part.to_csv(tmp_path / f"part-{i}.csv", index=False)
    sample, counts = sample_flows(sorted(tmp_path.glob("part-*.csv")), attack_cap=900, benign_cap=3000)
    kept = sample["label"].value_counts()
    assert counts["DDoS-ICMP_Flood"] == 9000 and counts["XSS"] == 15
    assert kept["XSS"] == 15                          # rare attack kept whole
    assert 700 < kept["DDoS-ICMP_Flood"] < 1100       # about the cap, picked from every part
    assert 2700 < kept[BENIGN] < 3300
