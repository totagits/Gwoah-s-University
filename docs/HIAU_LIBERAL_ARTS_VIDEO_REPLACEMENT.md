# HIAU BA Liberal Arts & Humanities video replacement

The user stated that the new file is **image_20261108_233524.mp4**.

The public degree page has been updated to use:

`public/assets/degree-clips/image_20261108_233524.mp4`

This file must be uploaded to the **fix/hiau-liberal-arts-user-video** GitHub branch before this pull request is merged. At implementation time it was not present in the `staging` GitHub tree, so the media itself has not been verified.

The exact degree route is:
`#degree=liberal_arts--bachelor-of-arts-in-liberal-arts-humanities`

Only this degree's video mapping changes. The two previously uploaded BBA Accounting and Entrepreneurship clips remain mapped to their own pages, as do all other degree videos and the two homepage carousel videos.

**Do not merge while the MP4 asset is absent.** After upload, verify the file exists and contains a playable video and audio stream, rerun GitHub CI, then merge and verify live Coolify playback separately.
