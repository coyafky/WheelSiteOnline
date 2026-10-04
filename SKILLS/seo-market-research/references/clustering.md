# Page-Ownership Clustering

## Principle

Clustering answers whether queries may share a URL, not whether they are topically related. Semantic similarity proposes pairs; localized SERP overlap and decision compatibility evaluate ownership.

## Method

1. Normalize records while retaining originals and provenance.
2. Generate candidate pairs with tokens, embeddings, modifiers, topics, or preliminary intent.
3. Capture comparable SERPs in the same market/time/device context.
4. Compute shared URLs, URL Jaccard, rank-weighted overlap, shared domains, freshness, and completeness.
5. Check goal intent, page type, product line, manufacturing process, and B2B-job compatibility.
6. Produce `SAME_PAGE_CANDIDATE`, `REVIEW`, or `SEPARATE_CANDIDATE` edges, never silent final decisions.
7. Form hard page-owner candidates or soft topical neighborhoods.
8. Validate medoids/endpoints. A-B and B-C do not automatically justify A-C.
9. Record every human merge/split and its decisive evidence.

## Script Formula

`scripts/serp_overlap.py` canonicalizes URLs for analysis only and calculates exact shared count, URL Jaccard, rank-weighted Jaccard using `1 / log2(rank + 1)`, shared domains, compatibility reasons, and a configurable candidate edge.

Thresholds are run configuration, not universal truths. Defaults are conservative suggestions and must be reviewed for the market and result depth.

## Ownership Evidence

Same-page evidence requires meaningful exact overlap, compatible goal/job/page type, no business or process identity conflict, and acceptable endpoint/medoid coherence.

Separate-page evidence includes little overlap, different product/category versus capability/reference goals, supplier-discovery versus technical-validation differences, separate manufacturing-process products, incompatible result types, or unresolved sparse/mixed evidence.

Shared domains are secondary because broad sites can rank different URLs for different needs.
