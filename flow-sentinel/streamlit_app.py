"""Streamlit Community Cloud host for Flow Sentinel, the ML major project (Case Study 148).

The UI is the Next.js app in "Machine Learning/Case Study 148 - Network Intrusion Detection/web". `bun run
build:streamlit` there builds it as static files into static/ next to this script, and Streamlit serves that folder at
/app/static/ (server.enableStaticServing in .streamlit/config.toml). This page only shows that site full-screen. The
model runs in the visitor's browser, so nothing here needs Python beyond Streamlit itself.
"""
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="Flow Sentinel · Walrus Securitas", page_icon="🛡️", layout="wide")
st.markdown("""<style>
header[data-testid="stHeader"], [data-testid="stToolbar"], [data-testid="stDecoration"], footer {display: none;}
.stApp, [data-testid="stAppViewContainer"] {background: #ffffff;}
iframe[title="streamlit_app.iframe"], iframe[title="st.iframe"] {
  position: fixed; inset: 0; width: 100vw !important; height: 100vh !important; border: 0; z-index: 1000;
}
</style>""", unsafe_allow_html=True)
components.iframe("app/static/index.html", height=900, scrolling=True)  # scrolling is off by default
