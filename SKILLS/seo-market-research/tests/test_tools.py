from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SKILL = Path(__file__).resolve().parents[1]
SCRIPTS = SKILL / "scripts"


def run_script(name: str, *arguments: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(SCRIPTS / name), *arguments],
        check=check,
        capture_output=True,
        text=True,
    )


def write_jsonl(path: Path, records: list[dict]) -> None:
    path.write_text("".join(json.dumps(record) + "\n" for record in records), encoding="utf-8")


class SkillToolsTest(unittest.TestCase):
    def test_init_and_validate_run(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            run_dir = Path(temporary) / "run"
            run_script(
                "init_run.py",
                "--output",
                str(run_dir),
                "--project-id",
                "test-project",
                "--scope",
                "wheels-us",
                "--country",
                "US",
                "--language",
                "en",
                "--product-line",
                "Automotive Wheels",
            )
            result = run_script("validate_run.py", str(run_dir))
            self.assertIn("0 error(s)", result.stdout)
            manifest = json.loads((run_dir / "run-manifest.json").read_text(encoding="utf-8"))
            self.assertEqual(manifest["search_context"]["country"], "US")
            self.assertEqual(manifest["phase_status"]["contract"]["status"], "IN_PROGRESS")

    def test_validator_rejects_csv_output(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            run_dir = Path(temporary) / "run"
            run_script(
                "init_run.py",
                "--output",
                str(run_dir),
                "--project-id",
                "test-project",
                "--scope",
                "test",
                "--country",
                "DE",
                "--language",
                "de",
                "--product-line",
                "Automotive Wheels",
            )
            (run_dir / "deliverables" / "keywords.csv").write_text("keyword\nwheel\n", encoding="utf-8")
            result = run_script("validate_run.py", str(run_dir), check=False)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("CSV output is forbidden", result.stdout)

    def test_normalize_queries_merges_provenance_without_promoting_status(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / "queries.jsonl"
            target = root / "normalized.jsonl"
            write_jsonl(
                source,
                [
                    {
                        "query": "  Forged  Wheels ",
                        "language": "en",
                        "country": "US",
                        "source_ids": ["src_a"],
                        "discovery_methods": ["business_terms"],
                        "hypothesis_status": "GENERATED",
                    },
                    {
                        "query": "forged wheels",
                        "language": "en",
                        "country": "US",
                        "source_ids": ["src_b"],
                        "discovery_methods": ["serp_suggestion"],
                        "hypothesis_status": "OBSERVED",
                    },
                ],
            )
            run_script("normalize_queries.py", "--input", str(source), "--output", str(target))
            rows = [json.loads(line) for line in target.read_text(encoding="utf-8").splitlines()]
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["normalized_query"], "forged wheels")
            self.assertEqual(rows[0]["source_ids"], ["src_a", "src_b"])
            self.assertEqual(rows[0]["hypothesis_status"], "UNRESOLVED")

    def test_serp_overlap_emits_candidate_not_final_cluster(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / "serps.jsonl"
            target = root / "edges.jsonl"
            common = [
                {"rank": 1, "url": "https://a.example/products/?utm_source=x", "result_type": "ORGANIC"},
                {"rank": 2, "url": "https://b.example/wheels", "result_type": "ORGANIC"},
                {"rank": 3, "url": "https://c.example/forged", "result_type": "ORGANIC"},
            ]
            write_jsonl(
                source,
                [
                    {
                        "serp_snapshot_id": "serp_a",
                        "query_id": "qry_a",
                        "engine": "google",
                        "country": "US",
                        "language": "en",
                        "device": "desktop",
                        "completeness": "COMPLETE",
                        "serp_goal_intent": "SUPPLIER_DISCOVERY",
                        "dominant_page_type": "PRODUCT_CATEGORY",
                        "results": common,
                        "source_ids": ["src_serp_a"],
                    },
                    {
                        "serp_snapshot_id": "serp_b",
                        "query_id": "qry_b",
                        "engine": "google",
                        "country": "US",
                        "language": "en",
                        "device": "desktop",
                        "completeness": "COMPLETE",
                        "serp_goal_intent": "SUPPLIER_DISCOVERY",
                        "dominant_page_type": "PRODUCT_CATEGORY",
                        "results": common,
                        "source_ids": ["src_serp_b"],
                    },
                ],
            )
            run_script("serp_overlap.py", "--input", str(source), "--output", str(target))
            edge = json.loads(target.read_text(encoding="utf-8").strip())
            self.assertEqual(edge["shared_url_count"], 3)
            self.assertEqual(edge["edge_type"], "SAME_PAGE_CANDIDATE")
            self.assertEqual(edge["configuration"]["status"], "REQUIRES_HUMAN_REVIEW")

    def test_html_renderer_escapes_markup_and_rejects_javascript_links(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / "report.md"
            target = root / "report.html"
            source.write_text(
                "# Report\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))\n\n[good](https://example.com)\n",
                encoding="utf-8",
            )
            run_script("render_html.py", "--input", str(source), "--output", str(target))
            rendered = target.read_text(encoding="utf-8")
            self.assertIn("&lt;script&gt;", rendered)
            self.assertNotIn('href="javascript:', rendered)
            self.assertIn('href="https://example.com"', rendered)
            self.assertIn("Generated view:", rendered)


if __name__ == "__main__":
    unittest.main()
