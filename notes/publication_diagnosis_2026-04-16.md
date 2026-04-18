# Publication diagnosis notes

- Current published domain `https://bonacms-5wz58zyw.manus.space/` opens the Bonavista CMS project public catalog and shows metric `Published yachts: 1`.
- Database inspection shows yacht `Большая яхта 1` with slug `1` and status `published`.
- The old URL `https://3002-ix0048fpxw4em89p5kzdy-bb8ae1a6.us2.manus.computer` opens a different Bonavista marketing-style site and does not contain the text `Большая яхта 1`.
- Initial hypothesis: the user is checking an outdated separate site URL, while the active CMS project public catalog is the published `bonacms-5wz58zyw.manus.space` domain.

A follow-up browser check on the current dev preview confirmed that the public catalog renders the card `Большая яхта 1` with status `published`, matching the database inspection.

A CMS dashboard check confirmed the new 'Live public catalog link' block is visible. The dashboard also shows total yachts: 2, published: 1, drafts: 1, which matches the database inspection.
