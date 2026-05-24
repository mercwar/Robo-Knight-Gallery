#!/bin/bash
# /* AVIS_COORD: AVIS://GITHUB/MAPPER/FIRE-SITE/1.0.CVBGOD */
# /* ROLE: CYBORG Artifact Mapper & XML Generator */

# 1. Extract Authority: Convert git SSH or HTTPS to standard Blob URL
REPO_URL=$(git config --get remote.origin.url | sed 's/\.git$//' | sed 's/git@github.com:/https:\/\/github.com\//')
BRANCH="main"
BASE_URL="${REPO_URL}/blob/${BRANCH}"

OUTPUT_FILE="sitemap.xml"

# 2. XML Header: Standard Sitemaps Protocol
echo '<?xml version="1.0" encoding="UTF-8"?>' > "$OUTPUT_FILE"
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' >> "$OUTPUT_FILE"

# 3. Recursive Crawl: Mapping all artifacts within the Domain
# Excludes .git and the sitemap/script itself to maintain purity
find . -type f -not -path '*/.git/*' -not -name "$OUTPUT_FILE" -not -name "fire-site.sh" | while read -r file; do
    # Remove leading ./
    CLEAN_PATH="${file#./}"
    
    # URL encode spaces (critical for "Version 1" and "CYBORG" naming conventions)
    ENCODED_PATH=$(echo "$CLEAN_PATH" | sed 's/ /%20/g')
    
    echo "  <url>" >> "$OUTPUT_FILE"
    echo "    <loc>${BASE_URL}/${ENCODED_PATH}</loc>" >> "$OUTPUT_FILE"
    echo "  </url>" >> "$OUTPUT_FILE"
done

# 4. Closing the Protocol
echo '</urlset>' >> "$OUTPUT_FILE"

echo "wm_macro_ack: XML Sentinel Map generated: $OUTPUT_FILE"
