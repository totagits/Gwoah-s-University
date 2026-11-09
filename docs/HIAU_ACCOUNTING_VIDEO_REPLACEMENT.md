# HIAU replacement Accounting clip

The user-provided MP4 `image_20261108_223153(1).mp4` is a 10-second, 1280×720 H.264/AAC visual introduction specifically labelled **BBA in Accounting — HIAU**.

The clip must be stored at:

`public/assets/degree-clips/business--bachelor-of-business-administration-in-accounting-user.mp4`

This branch switches only the corresponding Accounting degree detail page to that exact asset. Other 18 degree explainers and both homepage carousel videos remain unchanged.

## Safe upload and merge gate

The binary file is not yet present in the repository. The GitHub text connector cannot accept local binary sandbox files.

1. Upload the provided video with the exact filename above to the feature branch.
2. Confirm the file exists and is a playable MP4 with H.264 video and AAC audio.
3. Verify the Accounting degree page now plays the submitted video and its original text appears correctly.
4. Check all other degree clips and the two original homepage videos remain unchanged.
5. Only then merge this PR into staging and validate Coolify deployment.

**Do not merge until the MP4 exists.** The code references a new path and would otherwise produce a 404 for the Accounting clip.
