---
description: Formatting, verification badge, and layout standards for resume generation in this codebase.
globs: "**/*resume*, **/*cv*, fischer/**"
---

# Resume & CV Standards

## 1. Page Count Invariant
- Every resume generated (HTML -> PDF via headless Chrome) must fit strictly on **1 Page (A4)**.
- Always verify page count with PyMuPDF: `assert len(doc) == 1`.

## 2. Verification Badges & External Links
- **Uniform Labeling**: All external credential links, certificate authentications, coding profiles (e.g., LeetCode), and hackathons must be formatted uniformly as `[Verify]` (`<a class="badge-link" href="...">[Verify]</a>` in HTML or docx hyperlink with text `[Verify]`).
- **Forbidden Patterns**:
  - Do NOT use vendor-tagged badges like `[Verify Oracle]`, `[Verify Coursera]`, or `[Verify Credential]`.
  - Do NOT print raw profile URLs in parentheses, such as `(leetcode.com/u/0777AJ/)`. Use `[Verify]` instead.

## 3. Recruiter Keyword & Metric Highlighting
- In **Projects** and **Work Experience/Training** bullet points, avoid over-bolding text.
- Highlight at most **1 to 2 punchy technical keywords, architectural terms, or high-impact metrics** (e.g., `3x higher throughput`, `35%`, `sub-120ms response times`, `WebRTC data channels`) per bullet point.

## 4. Multi-Format Sync & Scoping
- Whenever modifying resumes, synchronize all three formats: `.html`, `.pdf`, and `.docx`.
- Sub-directory resumes (e.g., `fischer/`) are role-specific; never overwrite or alter root templates when working on sub-directory resumes unless specifically instructed.
